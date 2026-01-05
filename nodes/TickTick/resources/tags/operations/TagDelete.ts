import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagDeleteFields: INodeProperties[] = [
	{
		displayName: "Tag",
		name: "tagName",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The tag to delete",
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
				operation: ["delete"],
			},
		},
	},
];

export async function tagDeleteExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tagNameValue = this.getNodeParameter("tagName", index) as
		| string
		| { mode: string; value: string };

	let tagName: string;

	if (typeof tagNameValue === "object" && tagNameValue !== null) {
		tagName = tagNameValue.value || "";
	} else {
		tagName = tagNameValue || "";
	}

	const response = await tickTickApiRequestV2.call(
		this,
		"DELETE",
		"/tag",
		{},
		{ name: tagName },
	);

	return [
		{
			json: {
				success: true,
				deletedTag: tagName,
				...response,
			},
		},
	];
}
