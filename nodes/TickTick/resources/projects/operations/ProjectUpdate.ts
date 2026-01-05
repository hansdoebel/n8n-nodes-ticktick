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
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The project to update",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchProjects",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				validation: [
					{
						type: "regex",
						properties: {
							regex: "^[a-zA-Z0-9]+$",
							errorMessage: "Project ID must contain only letters and numbers",
						},
					},
				],
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
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

	// Get the project ID from the resource locator
	const projectIdValue = this.getNodeParameter("projectId", index, "") as
		| string
		| { mode: string; value: string };

	let projectId: string;

	// Handle both resource locator format and legacy string format
	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectId = projectIdValue.value || "";
	} else {
		projectId = projectIdValue || "";
	}

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
