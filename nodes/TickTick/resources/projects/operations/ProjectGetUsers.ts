import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectGetUsersFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description:
			"The shared project to get users from. Only projects shared with other users are shown.",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchSharedProjects",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
			},
		],
		displayOptions: {
			show: {
				resource: ["project"],
				operation: ["getUsers"],
				authentication: ["tickTickSessionApi"],
			},
		},
	},
];

export async function projectGetUsersExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const projectIdValue = this.getNodeParameter("projectId", index) as
		| string
		| { mode: string; value: string };

	const projectId = typeof projectIdValue === "object"
		? projectIdValue.value
		: projectIdValue;

	if (!projectId?.trim()) {
		throw new Error("Project ID is required");
	}

	const syncResponse = (await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.SYNC,
	)) as IDataObject;

	const projects = (syncResponse.projectProfiles || []) as IDataObject[];
	const inboxId = syncResponse.inboxId as string | undefined;

	if (inboxId && projectId === inboxId) {
		throw new NodeOperationError(
			this.getNode(),
			"Cannot get users from Inbox. The Inbox is a personal project and cannot be shared.",
			{ itemIndex: index },
		);
	}

	const project = projects.find((p) => p.id === projectId);

	if (project) {
		const userCount = project.userCount as number | undefined;
		if (userCount === undefined || userCount <= 1) {
			throw new NodeOperationError(
				this.getNode(),
				"This project is not shared with other users. Only shared/collaborative projects have a user list.",
				{ itemIndex: index },
			);
		}
	}

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		ENDPOINTS.PROJECT_USERS(projectId),
	);

	return [{ json: response }];
}
