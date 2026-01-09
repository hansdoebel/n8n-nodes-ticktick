import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeApiError, NodeOperationError } from "n8n-workflow";

import { registry, sharedMethods } from "./resources";

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
					{ name: "Project", value: "project" },
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
		loadOptions: registry.getAllLoadOptions(),
		listSearch: {
			...registry.getAllListSearch(),
			...sharedMethods.listSearch,
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
