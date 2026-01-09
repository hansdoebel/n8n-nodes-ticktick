import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	isV2Auth,
	tickTickApiRequest,
	tickTickApiRequestV2,
} from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectCreateFields: INodeProperties[] = [
	{
		displayName: "Project Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		description: "The name of the project to create",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["project"], operation: ["create"] } },
	},
	{
		displayName: "Additional Fields (JSON)",
		name: "additionalFieldsJson",
		type: "json",
		typeOptions: { alwaysOpenEditWindow: true },
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["create"],
				jsonParameters: [true],
			},
		},
		description: "Raw JSON body to send directly to TickTick",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#F18181",
				description: "Color of the project in Hex format",
			},
			{
				displayName: "Kind",
				name: "kind",
				type: "options",
				options: [
					{ name: "Note", value: "NOTE" },
					{ name: "Task", value: "TASK" },
				],
				default: "TASK",
				description: "Kind of project",
			},
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
				description: "Sort order value of the project",
			},
			{
				displayName: "View Mode",
				name: "viewMode",
				type: "options",
				options: [
					{ name: "Kanban", value: "kanban" },
					{ name: "List", value: "list" },
					{ name: "Timeline", value: "timeline" },
				],
				default: "list",
				description: "Default view mode for the project",
			},
		],
	},
];

export async function projectCreateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	function setIfDefined(target: Record<string, any>, key: string, value: any) {
		if (value !== undefined && value !== "" && value !== null) {
			target[key] = value;
		}
	}

	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: Record<string, any> = {};

	if (useJson) {
		const jsonString = this.getNodeParameter(
			"additionalFieldsJson",
			index,
			"{}",
		) as string;
		try {
			body = JSON.parse(jsonString);
		} catch (error) {
			throw new Error(`Invalid JSON provided: ${error.message}`);
		}
	} else {
		const name = this.getNodeParameter("name", index) as string;
		const additional = this.getNodeParameter(
			"additionalFields",
			index,
			{},
		) as Record<string, any>;

		const cleaned: Record<string, any> = {};

		cleaned.name = name;

		setIfDefined(cleaned, "color", additional.color);
		setIfDefined(cleaned, "kind", additional.kind);
		setIfDefined(cleaned, "sortOrder", additional.sortOrder);
		setIfDefined(cleaned, "viewMode", additional.viewMode);

		body = cleaned;
	}

	const useV2 = isV2Auth(this, index);

	if (useV2) {
		const batchBody = {
			add: [body],
		};
		const response = await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.PROJECTS_BATCH,
			batchBody,
		);
		return [{ json: response }];
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		ENDPOINTS.OPEN_V1_PROJECT,
		body,
	);
	return [{ json: response }];
}
