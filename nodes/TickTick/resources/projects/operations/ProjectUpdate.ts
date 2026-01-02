import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { tickTickApiRequest } from "@ticktick/GenericFunctions";

export const projectUpdateFields: INodeProperties[] = [
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["project"], operation: ["update"] } },
	},
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		required: true,
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
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
				operation: ["update"],
				jsonParameters: [true],
			},
		},
		description: "Raw JSON body to send directly to TickTick",
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["update"],
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
				displayName: "Name",
				name: "name",
				type: "string",
				default: "",
				description: "Name of the project",
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

export async function projectUpdateExecute(
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
	const projectId = this.getNodeParameter("projectId", index, "") as string;
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
		const updateFields = this.getNodeParameter(
			"updateFields",
			index,
			{},
		) as Record<string, any>;

		const cleaned: Record<string, any> = {};

		setIfDefined(cleaned, "color", updateFields.color);
		setIfDefined(cleaned, "kind", updateFields.kind);
		setIfDefined(cleaned, "name", updateFields.name);
		setIfDefined(cleaned, "sortOrder", updateFields.sortOrder);
		setIfDefined(cleaned, "viewMode", updateFields.viewMode);

		body = cleaned;
	}

	if (!projectId) {
		throw new Error("Project ID is required for update operation.");
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		`/open/v1/project/${projectId}`,
		body,
	);
	return [{ json: response }];
}
