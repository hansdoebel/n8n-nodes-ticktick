import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeApiError, NodeOperationError } from "n8n-workflow";

import * as taskOps from "./resources/tasks/operations";
import * as projectOps from "./resources/projects/operations";

import { taskFields, taskOperations } from "./resources/tasks/TasksDescription";
import {
	projectFields,
	projectOperations,
} from "./resources/projects/ProjectsDescription";

import { getProjects, getTasks } from "@ticktick/GenericFunctions";

export class TickTick implements INodeType {
	description: INodeTypeDescription = {
		displayName: "TickTick",
		name: "tickTick",
		icon: "file:ticktick.svg",
		group: ["transform"],
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		version: 1,
		description: "Interact with TickTick tasks and projects",
		defaults: {
			name: "TickTick",
		},
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
		],
		properties: [
			{
				displayName: "Authentication",
				name: "authentication",
				type: "options",
				options: [
					{ name: "Access Token", value: "tickTickTokenApi" },
					{ name: "OAuth2", value: "tickTickOAuth2Api" },
				],
				default: "tickTickTokenApi",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{ name: "Task", value: "task" },
					{ name: "Project", value: "project" },
				],
				default: "task",
			},
			...taskOperations,
			...taskFields,
			...projectOperations,
			...projectFields,
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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter("resource", i) as string;
				const operation = this.getNodeParameter("operation", i) as string;

				let result: INodeExecutionData[] = [];

				if (resource === "task") {
					switch (operation) {
						case "create":
							result = await taskOps.taskCreateExecute.call(this, i);
							break;
						case "get":
							result = await taskOps.taskGetExecute.call(this, i);
							break;
						case "update":
							result = await taskOps.taskUpdateExecute.call(this, i);
							break;
						case "complete":
							result = await taskOps.taskCompleteExecute.call(this, i);
							break;
						case "delete":
							result = await taskOps.taskDeleteExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "project") {
					switch (operation) {
						case "create":
							result = await projectOps.projectCreateExecute.call(this, i);
							break;
						case "get":
							result = await projectOps.projectGetExecute.call(this, i);
							break;
						case "update":
							result = await projectOps.projectUpdateExecute.call(this, i);
							break;
						case "delete":
							result = await projectOps.projectDeleteExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource type: ${resource}`,
					);
				}

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
