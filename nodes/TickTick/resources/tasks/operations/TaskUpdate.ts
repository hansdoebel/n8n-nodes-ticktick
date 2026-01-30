import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
	TimeZones,
} from "@ticktick/helpers";
import { isV2Auth, tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const taskUpdateFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		description: "The project containing the task",
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
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "Task",
		name: "taskId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: true,
		description: "The task to update",
		modes: [
			{
				displayName: "From List",
				name: "list",
				type: "list",
				typeOptions: {
					searchListMethod: "searchTasks",
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: "By ID",
				name: "id",
				type: "string",
				placeholder: "e.g. 6123abc456def789",
			},
		],
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["task"], operation: ["update"] } },
	},
	{
		displayName: "Additional Fields (JSON)",
		name: "additionalFieldsJson",
		type: "json",
		typeOptions: { alwaysOpenEditWindow: true },
		default: "",
		displayOptions: {
			show: {
				resource: ["task"],
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
				resource: ["task"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: "All Day",
				name: "isAllDay",
				type: "boolean",
				default: false,
			},
			{
				displayName: "Completed Time",
				name: "completedTime",
				type: "dateTime",
				default: "",
				description: "Time when task was completed",
			},
			{
				displayName: "Content",
				name: "content",
				type: "string",
				default: "",
				description: "Main content or note for the task",
			},
			{
				displayName: "Description (Checklist)",
				name: "desc",
				type: "string",
				default: "",
			},
			{
				displayName: "Due Date",
				name: "dueDate",
				type: "dateTime",
				default: "",
			},
			{
				displayName: "Items (Subtasks)",
				name: "items",
				type: "fixedCollection",
				default: [],
				placeholder: "Add Subtask",
				typeOptions: { multipleValues: true },
				options: [
					{
						name: "item",
						displayName: "Item",
						values: [
							{
								displayName: "All Day",
								name: "isAllDay",
								type: "boolean",
								default: false,
							},
							{
								displayName: "Completed Time",
								name: "completedTime",
								type: "dateTime",
								default: "",
							},
							{
								displayName: "Sort Order",
								name: "sortOrder",
								type: "number",
								default: 0,
							},
							{
								displayName: "Start Date",
								name: "startDate",
								type: "dateTime",
								default: "",
							},
							{
								displayName: "Status",
								name: "status",
								type: "options",
								options: [
									{ name: "Normal", value: 0 },
									{ name: "Completed", value: 1 },
								],
								default: 0,
							},
							{
								displayName: "Time Zone",
								name: "timeZone",
								type: "options",
								options: TimeZones,
								default: "",
							},
							{
								displayName: "Title",
								name: "title",
								type: "string",
								default: "",
							},
						],
					},
				],
			},
			{
				displayName: "Priority",
				name: "priority",
				type: "options",
				default: 0,
				options: [
					{ name: "None", value: 0 },
					{ name: "Low", value: 1 },
					{ name: "Medium", value: 3 },
					{ name: "High", value: 5 },
				],
			},
			{
				displayName: "Reminders",
				name: "reminders",
				type: "string",
				default: "",
				description:
					'Comma-separated reminder triggers, e.g. "TRIGGER:PT0S,TRIGGER:P0DT9H0M0S"',
			},
			{
				displayName: "Repeat Flag",
				name: "repeatFlag",
				type: "string",
				default: "",
				description: "Recurrence rule (RRULE) such as FREQ=DAILY;INTERVAL=1",
			},
			{
				displayName: "Sort Order",
				name: "sortOrder",
				type: "number",
				default: 0,
			},
			{
				displayName: "Start Date",
				name: "startDate",
				type: "dateTime",
				default: "",
			},
			{
				displayName: "Status",
				name: "status",
				type: "options",
				options: [
					{ name: "Normal", value: 0 },
					{ name: "Completed", value: 2 },
				],
				default: 0,
			},
			{
				displayName: "Tags",
				name: "tags",
				type: "fixedCollection",
				default: { tagValues: [] },
				placeholder: "Add Tag",
				typeOptions: { multipleValues: true },
				options: [
					{
						name: "tagValues",
						displayName: "Tag",
						values: [
							{
								displayName: "Tag",
								name: "tag",
								type: "resourceLocator",
								default: { mode: "list", value: "" },
								description: "The tag to assign to the task",
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
										placeholder: "e.g. important",
									},
								],
							},
						],
					},
				],
				description: "Tags to assign to the task (V2 API only)",
			},
			{
				displayName: "Time Zone",
				name: "timeZone",
				type: "options",
				options: TimeZones,
				default: "",
			},
			{
				displayName: "Title",
				name: "title",
				type: "string",
				default: "",
			},
		],
	},
];

function extractResourceLocatorValue(
	value: string | { mode: string; value: string } | undefined,
): string {
	if (typeof value === "object" && value !== null) {
		return value.value || "";
	}
	return value || "";
}

function buildSubtask(sub: Record<string, any>): Record<string, any> {
	const subtask: Record<string, any> = {};
	if (sub.completedTime) {
		subtask.completedTime = formatTickTickDate(sub.completedTime);
	}
	if (sub.isAllDay !== undefined) subtask.isAllDay = sub.isAllDay;
	if (sub.sortOrder !== undefined && sub.sortOrder !== "") {
		subtask.sortOrder = sub.sortOrder;
	}
	if (sub.startDate) subtask.startDate = formatTickTickDate(sub.startDate);
	if (sub.status !== undefined) subtask.status = sub.status;
	if (sub.timeZone) subtask.timeZone = sub.timeZone;
	if (sub.title !== undefined && sub.title !== "") subtask.title = sub.title;
	return subtask;
}

async function fetchCurrentTask(
	context: IExecuteFunctions,
	taskId: string,
	useV2: boolean,
): Promise<IDataObject> {
	if (useV2) {
		const response = (await tickTickApiRequestV2.call(
			context,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;
		const tasks =
			((response.syncTaskBean as IDataObject)?.update || []) as IDataObject[];
		return tasks.find((t) => String(t.id) === taskId) || {};
	}

	try {
		return await tickTickApiRequest.call(
			context,
			"GET",
			`/open/v1/project/all/task/${taskId}`,
		);
	} catch {
		return {};
	}
}

function parseReminders(reminders: string): string[] {
	return reminders
		.split(",")
		.map((r) => r.trim())
		.filter((r) => r.length > 0);
}

function buildTaskBody(
	currentTask: IDataObject,
	updateFields: Record<string, any>,
	taskId: string,
	projectId: string,
): Record<string, any> {
	const body: Record<string, any> = { ...currentTask };

	body.id = taskId;
	body.projectId = projectId || currentTask.projectId || "inbox";

	const directFields = [
		"content",
		"desc",
		"isAllDay",
		"priority",
		"repeatFlag",
		"sortOrder",
		"status",
		"timeZone",
		"title",
	];
	for (const field of directFields) {
		if (
			updateFields[field] !== undefined && updateFields[field] !== "" &&
			updateFields[field] !== null
		) {
			body[field] = updateFields[field];
		}
	}

	const dateFields = ["dueDate", "completedTime", "startDate"];
	for (const field of dateFields) {
		if (updateFields[field]) {
			body[field] = formatTickTickDate(updateFields[field]);
		}
	}

	if (
		updateFields.tags?.tagValues && Array.isArray(updateFields.tags.tagValues)
	) {
		const tags = updateFields.tags.tagValues
			.map((item: { tag: string | { mode: string; value: string } }) => {
				if (typeof item.tag === "object" && item.tag !== null) {
					return item.tag.value;
				}
				return item.tag;
			})
			.filter((tag: string) => tag && tag.trim() !== "");
		if (tags.length > 0) {
			body.tags = tags;
		}
	}

	if (updateFields.reminders) {
		const reminders = parseReminders(updateFields.reminders as string);
		if (reminders.length > 0) {
			body.reminders = reminders;
		}
	}

	if (updateFields.items?.item && Array.isArray(updateFields.items.item)) {
		const subtasks = updateFields.items.item
			.map(buildSubtask)
			.filter((s: Record<string, any>) => Object.keys(s).length > 0);
		if (subtasks.length > 0) {
			body.items = subtasks;
		}
	}

	return body;
}

export async function taskUpdateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	const taskId = extractResourceLocatorValue(
		this.getNodeParameter("taskId", index) as string | {
			mode: string;
			value: string;
		},
	);
	const projectId = extractResourceLocatorValue(
		this.getNodeParameter("projectId", index, "") as string | {
			mode: string;
			value: string;
		},
	);

	if (!taskId.trim()) {
		throw new Error("Task ID is required");
	}

	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	const useV2 = isV2Auth(this, index);
	const currentTask = await fetchCurrentTask(this, taskId, useV2);

	let body: Record<string, any>;

	if (useJson) {
		const jsonString = this.getNodeParameter(
			"additionalFieldsJson",
			index,
			"{}",
		) as string;
		try {
			body = JSON.parse(jsonString);
		} catch (error) {
			throw new Error(`Invalid JSON provided: ${(error as Error).message}`);
		}
	} else {
		const updateFields = this.getNodeParameter(
			"updateFields",
			index,
			{},
		) as Record<string, any>;
		body = buildTaskBody(currentTask, updateFields, taskId, projectId);
	}

	body.projectId ||= "inbox";
	body.id ||= taskId;
	body.title ||= currentTask.title;

	if (useV2) {
		const response = await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.TASKS_BATCH,
			{ update: [body] },
		);
		return [{ json: response }];
	}

	const response = await tickTickApiRequest.call(
		this,
		"POST",
		`/open/v1/task/${taskId}`,
		body,
	);
	return [{ json: response }];
}
