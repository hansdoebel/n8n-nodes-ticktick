import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const tagUpdateFields: INodeProperties[] = [
	{
		displayName: "Tag",
		name: "tagName",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The tag to update",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchTags",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By Name",
				name: "name",
				type: "string",
				placeholder: "e.g. Important",
			},
		],
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["update"],
			},
		},
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["update"],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "color",
				default: "#F18181",
				description: "The color of the tag in hex format",
			},
			{
				displayName: "Label",
				name: "label",
				type: "string",
				default: "",
				description: "The new display name for the tag",
			},
			{
				displayName: "Parent Tag",
				name: "parent",
				type: "resourceLocator",
				default: { mode: "list", value: "" },
				description: "The parent tag for nested tags",
				modes: [
					{
						displayName: "From List",
						name: "list",
						type: "list",
						typeOptions: {
							searchListMethod: "searchParentTags",
							searchable: true,
							searchFilterRequired: false,
						},
					},
					{
						displayName: "By Name",
						name: "name",
						type: "string",
						placeholder: "e.g. Projects",
					},
					{
						displayName: "None",
						name: "none",
						type: "string",
						placeholder: "No parent (top-level tag)",
						hint: "Leave empty to make this a top-level tag",
					},
				],
			},
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
				description: "The sort order of the tag",
			},
			{
				displayName: "Sort Type",
				name: "sortType",
				type: "options",
				options: [
					{ name: "None", value: "NONE" },
					{ name: "Manual", value: "MANUAL" },
					{ name: "Alphabetical", value: "ALPHABETICAL" },
				],
				default: "NONE",
				description: "How the tag is sorted within its group",
			},
		],
	},
];

export async function tagUpdateExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tagNameValue = this.getNodeParameter("tagName", index) as
		| string
		| { mode: string; value: string };
	const updateFields = this.getNodeParameter("updateFields", index) as {
		label?: string;
		color?: string;
		sortType?: string;
		parent?: string | { mode: string; value: string };
		sortOrder?: number;
	};

	let tagName: string;

	if (typeof tagNameValue === "object" && tagNameValue !== null) {
		tagName = tagNameValue.value || "";
	} else {
		tagName = tagNameValue || "";
	}

	let currentTagName = tagName;
	const results: Record<string, unknown> = { originalName: tagName };

	if (updateFields.label) {
		const renameBody = {
			name: tagName,
			newName: updateFields.label,
		};

		await tickTickApiRequestV2.call(
			this,
			"PUT",
			ENDPOINTS.TAG_RENAME,
			renameBody,
		);

		currentTagName = updateFields.label;
		results.renamed = true;
		results.newName = updateFields.label;
	}

	let parentValue: string | undefined;
	if (updateFields.parent) {
		if (
			typeof updateFields.parent === "object" && updateFields.parent !== null
		) {
			parentValue = updateFields.parent.value || undefined;
		} else {
			parentValue = updateFields.parent || undefined;
		}
	}

	const hasOtherUpdates = updateFields.color ||
		parentValue !== undefined ||
		(updateFields.sortType && updateFields.sortType !== "NONE") ||
		typeof updateFields.sortOrder === "number";

	if (hasOtherUpdates) {
		const tag: Record<string, unknown> = {
			name: currentTagName,
			label: currentTagName,
			rawName: currentTagName,
		};

		if (updateFields.color) {
			tag.color = updateFields.color;
		}
		if (parentValue !== undefined) {
			tag.parent = parentValue;
		}
		if (updateFields.sortType && updateFields.sortType !== "NONE") {
			tag.sortType = updateFields.sortType;
		}
		if (typeof updateFields.sortOrder === "number") {
			tag.sortOrder = updateFields.sortOrder;
		}

		const body = {
			update: [tag],
		};

		const response = await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.TAGS_BATCH,
			body,
		);

		return [{ json: { ...results, ...response } }];
	}

	if (updateFields.label) {
		return [
			{
				json: {
					success: true,
					originalName: tagName,
					newName: updateFields.label,
				},
			},
		];
	}

	throw new Error("At least one update field must be provided.");
}
