import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagMergeFields: INodeProperties[] = [
	{
		displayName: "Source Tag",
		name: "sourceTag",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The tag to merge from (will be deleted)",
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
				placeholder: "e.g. Old Tag",
			},
		],
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["merge"],
			},
		},
	},
	{
		displayName: "Target Tag",
		name: "targetTag",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The tag to merge into (will be kept)",
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
				placeholder: "e.g. New Tag",
			},
		],
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["merge"],
			},
		},
	},
];

export async function tagMergeExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sourceTagValue = this.getNodeParameter("sourceTag", index) as
		| string
		| { mode: string; value: string };
	const targetTagValue = this.getNodeParameter("targetTag", index) as
		| string
		| { mode: string; value: string };

	let sourceTag: string;
	let targetTag: string;

	if (typeof sourceTagValue === "object" && sourceTagValue !== null) {
		sourceTag = sourceTagValue.value || "";
	} else {
		sourceTag = sourceTagValue || "";
	}

	if (typeof targetTagValue === "object" && targetTagValue !== null) {
		targetTag = targetTagValue.value || "";
	} else {
		targetTag = targetTagValue || "";
	}

	const body = {
		name: sourceTag,
		newName: targetTag,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"PUT",
		"/tag/merge",
		body,
	);

	return [
		{
			json: {
				success: true,
				sourceTag,
				targetTag,
				...response,
			},
		},
	];
}
