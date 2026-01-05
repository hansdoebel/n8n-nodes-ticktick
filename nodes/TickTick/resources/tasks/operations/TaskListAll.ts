import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { tickTickApiRequestV2 } from "@helpers/apiRequest";

export const taskListAllFields: INodeProperties[] = [
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: "Max number of results to return",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listAll"],
			},
		},
	},
	{
		displayName: "Filters",
		name: "filters",
		type: "collection",
		placeholder: "Add Filter",
		default: {},
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["listAll"],
			},
		},
		options: [
			{
				displayName: "Project",
				name: "projectId",
				type: "resourceLocator",
				default: { mode: "list", value: "" },
				description: "Filter tasks by project (leave empty for all)",
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
						placeholder: "e.g. 5f9b3a4c8d2e1f0012345678",
					},
				],
			},
			{
				displayName: "Status",
				name: "status",
				type: "options",
				options: [
					{ name: "All", value: "all" },
					{ name: "Active", value: "active" },
					{ name: "Completed", value: "completed" },
				],
				default: "all",
				description: "Filter by task completion status",
			},
			{
				displayName: "Include Deleted",
				name: "includeDeleted",
				type: "boolean",
				default: false,
				description: "Whether to include tasks that are marked as deleted",
			},
		],
	},
];

export async function taskListAllExecute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const limit = this.getNodeParameter("limit", index, 0) as number;
	const filters = this.getNodeParameter("filters", index, {}) as {
		projectId?: string | { mode: string; value: string };
		status?: "all" | "active" | "completed";
		includeDeleted?: boolean;
	};

	// Handle resource locator format for projectId
	let projectId: string | undefined;
	if (filters.projectId) {
		if (typeof filters.projectId === "object" && filters.projectId !== null) {
			projectId = filters.projectId.value || undefined;
		} else {
			projectId = filters.projectId || undefined;
		}
	}

	const response = await tickTickApiRequestV2.call(
		this,
		"GET",
		"/batch/check/0",
	);

	const tasks: IDataObject[] = [];
	const syncTaskBean = response?.syncTaskBean as IDataObject | undefined;

	if (syncTaskBean?.update && Array.isArray(syncTaskBean.update)) {
		tasks.push(...(syncTaskBean.update as IDataObject[]));
	}

	if (syncTaskBean?.add && Array.isArray(syncTaskBean.add)) {
		tasks.push(...(syncTaskBean.add as IDataObject[]));
	}

	if (tasks.length) {
		const filtered = tasks.filter((task) => {
			if (projectId && task.projectId !== projectId) {
				return false;
			}

			if (!filters.includeDeleted && task.deleted === 1) {
				return false;
			}

			if (filters.status === "completed") {
				return task.status === 1;
			}

			if (filters.status === "active") {
				return task.status !== 1;
			}

			return true;
		});

		const limited = limit > 0 ? filtered.slice(0, limit) : filtered;
		return limited.map((task) => ({ json: task }));
	}

	return [{ json: response }];
}
