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

	// If filtering for completed tasks, use the dedicated /project/all/closed endpoint
	if (filters.status === "completed") {
		// Get date range for the last 30 days (or adjust as needed)
		const now = new Date();
		const thirtyDaysAgo = new Date(now);
		thirtyDaysAgo.setDate(now.getDate() - 30);

		const fromStr = thirtyDaysAgo.toISOString().replace("T", " ").substring(
			0,
			19,
		);
		const toStr = now.toISOString().replace("T", " ").substring(0, 19);

		const qs = {
			from: fromStr,
			to: toStr,
			status: "Completed",
			// Request a large batch since we'll filter by project client-side
			limit: String(1000),
		};

		const completedTasks = (await tickTickApiRequestV2.call(
			this,
			"GET",
			"/project/all/closed",
			{},
			qs,
		)) as IDataObject[];

		// Filter by project if specified
		let filtered = Array.isArray(completedTasks) ? completedTasks : [];
		if (projectId) {
			filtered = filtered.filter((task) => task.projectId === projectId);
		}

		// Apply user's limit after filtering by project
		const limited = limit > 0 ? filtered.slice(0, limit) : filtered;
		return limited.map((task) => ({ json: task }));
	}

	// For active or all tasks, use /batch/check/0
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

			// Note: /batch/check/0 only returns active tasks (status 0)
			// Completed tasks (status 2) are only available via /project/all/closed

			return true;
		});

		const limited = limit > 0 ? filtered.slice(0, limit) : filtered;
		return limited.map((task) => ({ json: task }));
	}

	return [{ json: response }];
}
