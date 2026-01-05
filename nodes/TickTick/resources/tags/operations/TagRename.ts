import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const tagRenameFields: INodeProperties[] = [
	{
		displayName: "Current Tag",
		name: "oldName",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The current name of the tag",
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
				placeholder: "e.g. OldName",
			},
		],
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["rename"],
			},
		},
	},
	{
		displayName: "New Name",
		name: "newName",
		type: "string",
		required: true,
		default: "",
		placeholder: "e.g. Important",
		description: "The new name for the tag",
		displayOptions: {
			show: {
				resource: ["tag"],
				operation: ["rename"],
			},
		},
	},
];

export async function tagRenameExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const oldNameValue = this.getNodeParameter("oldName", index) as
		| string
		| { mode: string; value: string };
	const newName = this.getNodeParameter("newName", index) as string;

	let oldName: string;

	if (typeof oldNameValue === "object" && oldNameValue !== null) {
		oldName = oldNameValue.value || "";
	} else {
		oldName = oldNameValue || "";
	}

	const body = {
		name: oldName,
		newName,
	};

	const response = await tickTickApiRequestV2.call(
		this,
		"PUT",
		"/tag/rename",
		body,
	);

	return [
		{
			json: {
				success: true,
				oldName,
				newName,
				...response,
			},
		},
	];
}
