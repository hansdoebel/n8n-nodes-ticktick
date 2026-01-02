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
import * as tagOps from "./resources/tags/operations";
import * as habitOps from "./resources/habits/operations";
import * as focusOps from "./resources/focus/operations";
import * as projectGroupOps from "./resources/projectGroups/operations";
import * as userOps from "./resources/user/operations";
import * as syncOps from "./resources/sync/operations";

import { taskFields, taskOperations } from "./resources/tasks/TasksDescription";
import {
	projectFields,
	projectOperations,
} from "./resources/projects/ProjectsDescription";
import { tagFields, tagOperations } from "./resources/tags/TagsDescription";
import {
	habitFields,
	habitOperations,
} from "./resources/habits/HabitsDescription";
import {
	focusFields,
	focusOperations,
} from "./resources/focus/FocusDescription";
import {
	projectGroupFields,
	projectGroupOperations,
} from "./resources/projectGroups/ProjectGroupsDescription";
import { userFields, userOperations } from "./resources/user/UserDescription";
import { syncFields, syncOperations } from "./resources/sync/SyncDescription";

import {
	getHabits,
	getProjectGroups,
	getProjects,
	getTags,
	getTasks,
} from "@ticktick/GenericFunctions";

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
					{ name: "Username/Password (V2 API)", value: "tickTickSessionApi" },
				],
				default: "tickTickTokenApi",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{ name: "Focus", value: "focus" },
					{ name: "Habit", value: "habit" },
					{ name: "Project", value: "project" },
					{ name: "Project Group", value: "projectGroup" },
					{ name: "Sync", value: "sync" },
					{ name: "Tag", value: "tag" },
					{ name: "Task", value: "task" },
					{ name: "User", value: "user" },
				],
				default: "task",
			},
			{
				displayName:
					"This resource requires V2 API authentication (Username/Password)",
				name: "v2Notice",
				type: "notice",
				default: "",
				displayOptions: {
					show: {
						resource: ["tag", "habit", "focus", "projectGroup", "user", "sync"],
						authentication: ["tickTickTokenApi", "tickTickOAuth2Api"],
					},
				},
			},
			...taskOperations,
			...taskFields,
			...projectOperations,
			...projectFields,
			...tagOperations,
			...tagFields,
			...habitOperations,
			...habitFields,
			...focusOperations,
			...focusFields,
			...projectGroupOperations,
			...projectGroupFields,
			...userOperations,
			...userFields,
			...syncOperations,
			...syncFields,
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
						case "listCompleted":
							result = await taskOps.taskListCompletedExecute.call(this, i);
							break;
						case "listDeleted":
							result = await taskOps.taskListDeletedExecute.call(this, i);
							break;
						case "move":
							result = await taskOps.taskMoveExecute.call(this, i);
							break;
						case "setParent":
							result = await taskOps.taskSetParentExecute.call(this, i);
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
				} else if (resource === "tag") {
					switch (operation) {
						case "list":
							result = await tagOps.tagListExecute.call(this, i);
							break;
						case "create":
							result = await tagOps.tagCreateExecute.call(this, i);
							break;
						case "update":
							result = await tagOps.tagUpdateExecute.call(this, i);
							break;
						case "delete":
							result = await tagOps.tagDeleteExecute.call(this, i);
							break;
						case "rename":
							result = await tagOps.tagRenameExecute.call(this, i);
							break;
						case "merge":
							result = await tagOps.tagMergeExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "habit") {
					switch (operation) {
						case "list":
							result = await habitOps.habitListExecute.call(this, i);
							break;
						case "get":
							result = await habitOps.habitGetExecute.call(this, i);
							break;
						case "create":
							result = await habitOps.habitCreateExecute.call(this, i);
							break;
						case "update":
							result = await habitOps.habitUpdateExecute.call(this, i);
							break;
						case "delete":
							result = await habitOps.habitDeleteExecute.call(this, i);
							break;
						case "checkin":
							result = await habitOps.habitCheckinExecute.call(this, i);
							break;
						case "archive":
							result = await habitOps.habitArchiveExecute.call(this, i);
							break;
						case "unarchive":
							result = await habitOps.habitUnarchiveExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "focus") {
					switch (operation) {
						case "getHeatmap":
							result = await focusOps.focusGetHeatmapExecute.call(this, i);
							break;
						case "getDistribution":
							result = await focusOps.focusGetDistributionExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "projectGroup") {
					switch (operation) {
						case "list":
							result = await projectGroupOps.projectGroupListExecute.call(
								this,
								i,
							);
							break;
						case "create":
							result = await projectGroupOps.projectGroupCreateExecute.call(
								this,
								i,
							);
							break;
						case "update":
							result = await projectGroupOps.projectGroupUpdateExecute.call(
								this,
								i,
							);
							break;
						case "delete":
							result = await projectGroupOps.projectGroupDeleteExecute.call(
								this,
								i,
							);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "user") {
					switch (operation) {
						case "getProfile":
							result = await userOps.userGetProfileExecute.call(this, i);
							break;
						case "getStatus":
							result = await userOps.userGetStatusExecute.call(this, i);
							break;
						case "getPreferences":
							result = await userOps.userGetPreferencesExecute.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported operation: ${resource}.${operation}`,
							);
					}
				} else if (resource === "sync") {
					switch (operation) {
						case "syncAll":
							result = await syncOps.syncAllExecute.call(this, i);
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
