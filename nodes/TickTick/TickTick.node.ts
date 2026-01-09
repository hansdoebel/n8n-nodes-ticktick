import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeApiError, NodeOperationError } from "n8n-workflow";

import { registry } from "./resources";
import {
	getHabits,
	getProjectGroups,
	getProjects,
	getTags,
	getTasks,
	searchProjects,
	searchTags,
	searchTasks,
} from "@ticktick/GenericFunctions";

export class TickTick implements INodeType {
	description: INodeTypeDescription = {
		displayName: "TickTick",
		name: "tickTick",
		icon: "file:../../icons/ticktick.svg",
		group: ["transform"],
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		version: 1,
		description: "Interact with TickTick tasks and projects",
		defaults: {
			name: "TickTick",
		},
		usableAsTool: true,
		inputs: ["main"],
		outputs: ["main"],
		credentials: [
			{
				name: "tickTickTokenApi",
				required: true,
				displayOptions: {
					show: { authentication: ["tickTickTokenApi"] },
				},
			},
			{
				name: "tickTickOAuth2Api",
				required: true,
				displayOptions: {
					show: { authentication: ["tickTickOAuth2Api"] },
				},
			},
			{
				name: "tickTickSessionApi",
				required: true,
				displayOptions: {
					show: { authentication: ["tickTickSessionApi"] },
				},
			},
		],
		properties: [
			{
				displayName: "Authentication",
				name: "authentication",
				type: "options",
				options: [
					{ name: "Access Token (V1 API)", value: "tickTickTokenApi" },
					{ name: "OAuth2 (V1 API)", value: "tickTickOAuth2Api" },
					{ name: "Email/Password (V2 API)", value: "tickTickSessionApi" },
				],
				default: "tickTickTokenApi",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				displayOptions: {
					show: {
						authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
					},
				},
				options: [
					{ name: "Project", value: "project" },
					{ name: "Task", value: "task" },
				],
				default: "task",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				displayOptions: {
					show: {
						authentication: ["tickTickSessionApi"],
					},
				},
				options: [
					// { name: "Focus", value: "focus" },
					// { name: "Habit", value: "habit" },
					{ name: "Project", value: "project" },
					// { name: "Project Group", value: "projectGroup" },
					{ name: "Sync", value: "sync" },
					{ name: "Tag", value: "tag" },
					{ name: "Task", value: "task" },
					{ name: "User", value: "user" },
				],
				default: "task",
			},
			...registry.getAllOperations(),
			...registry.getAllFields(),
		],
	};

	methods = {
		loadOptions: {
			async getProjects(this: ILoadOptionsFunctions) {
				return await getProjects.call(this);
			},
			async getTasks(this: ILoadOptionsFunctions) {
				const projectId = this.getCurrentNodeParameter("projectId") as string;
				return await getTasks.call(this, projectId);
			},
			async getHabits(this: ILoadOptionsFunctions) {
				return await getHabits.call(this);
			},
			async getTags(this: ILoadOptionsFunctions) {
				return await getTags.call(this);
			},
			async getProjectGroups(this: ILoadOptionsFunctions) {
				return await getProjectGroups.call(this);
			},
		},
		listSearch: {
			async searchProjects(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const results = await searchProjects.call(this, filter);
				return { results };
			},
			async searchProjectsForMove(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const results = await searchProjects.call(this, filter);

				try {
					const taskIdValue = this.getCurrentNodeParameter("taskId") as
						| string
						| { mode: string; value: string };

					let taskId: string;
					if (typeof taskIdValue === "object" && taskIdValue !== null) {
						taskId = taskIdValue.value || "";
					} else {
						taskId = taskIdValue || "";
					}

					if (taskId) {
						const authType = this.getCurrentNodeParameter(
							"authentication",
						) as string;

						if (authType === "tickTickSessionApi") {
							const { tickTickApiRequestV2 } = await import(
								"./helpers/apiRequest"
							);
							const syncResponse = (await tickTickApiRequestV2.call(
								this,
								"GET",
								"/batch/check/0",
							)) as any;

							const tasks = syncResponse?.syncTaskBean?.update || [];
							const task = tasks.find((t: any) => String(t.id) === taskId);

							if (task && task.projectId) {
								return {
									results: results.filter((r) => r.value !== task.projectId),
								};
							}
						}
					}
				} catch (error) {
					// Silently ignore errors - just return all projects
				}

				return { results };
			},
			async searchTags(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const results = await searchTags.call(this, filter);
				return { results };
			},
			async searchTasks(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const results = await searchTasks.call(this, filter);
				return { results };
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter("resource", i) as string;
				const operation = this.getNodeParameter("operation", i) as string;

				const handler = registry.getHandler(resource, operation);

				if (!handler) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation: ${resource}.${operation}`,
					);
				}

				const result = await handler.call(this, i);
				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error);
			}
		}

		return [returnData];
	}
}
