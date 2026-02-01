import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	isV2Auth,
	tickTickApiRequest,
	tickTickApiRequestV2,
} from "@helpers/apiRequest";
import { setIfDefined } from "@ticktick/helpers";
import { ENDPOINTS } from "@ticktick/constants/endpoints";
import type { ProjectBody } from "@ticktick/types/api";

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
				displayName: "Project Group Name or ID",
				name: "groupId",
				type: "options",
				typeOptions: {
					loadOptionsMethod: "getProjectGroups",
				},
				default: "",
				description:
					'Project group to place this project in. Requires V2 API (Email/Password authentication). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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

/** Additional fields from the n8n form */
interface ProjectAdditionalFields {
	color?: string;
	groupId?: string;
	kind?: string;
	sortOrder?: number;
	viewMode?: string;
}

export async function projectCreateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: ProjectBody = {};

	if (useJson) {
		const jsonString = this.getNodeParameter(
			"additionalFieldsJson",
			index,
			"{}",
		) as string;
		try {
			body = JSON.parse(jsonString) as ProjectBody;
		} catch (error) {
			throw new Error(`Invalid JSON provided: ${(error as Error).message}`);
		}
	} else {
		const name = this.getNodeParameter("name", index) as string;
		const additional = this.getNodeParameter(
			"additionalFields",
			index,
			{},
		) as ProjectAdditionalFields;

		if (!name || name.trim() === "") {
			throw new Error("Project name is required and cannot be empty");
		}

		const cleaned: ProjectBody = {};

		cleaned.name = name;

		setIfDefined(cleaned, "color", additional.color);
		setIfDefined(cleaned, "groupId", additional.groupId);
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
