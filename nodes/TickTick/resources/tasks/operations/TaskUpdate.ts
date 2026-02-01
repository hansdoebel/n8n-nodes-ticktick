import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import {
	extractResourceLocatorValue,
	extractTagValue,
	formatTickTickDate,
	parseReminders,
	tickTickApiRequest,
	TimeZones,
} from "@ticktick/helpers";
import { isV2Auth, tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";
import type {
	ChecklistItem,
	ResourceLocatorValue,
	TaskBody,
} from "@ticktick/types/api";

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
				displayName: "Clear Fields",
				name: "clearFields",
				type: "multiOptions",
				default: [],
				description: "Select fields to clear/remove from the task",
				options: [
					{ name: "Completed Time", value: "completedTime" },
					{ name: "Content", value: "content" },
					{ name: "Description", value: "desc" },
					{ name: "Due Date", value: "dueDate" },
					{ name: "Reminders", value: "reminders" },
					{ name: "Repeat Flag", value: "repeatFlag" },
					{ name: "Start Date", value: "startDate" },
					{ name: "Tags", value: "tags" },
					{ name: "Time Zone", value: "timeZone" },
				],
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
				displayName: "Remove Tags",
				name: "removeTags",
				type: "fixedCollection",
				default: { tagValues: [] },
				placeholder: "Add Tag to Remove",
				typeOptions: { multipleValues: true },
				description:
					"Select specific tags to remove from this task. Remaining tags are kept. (V2 API only)",
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
								description: "The tag to remove from the task",
								modes: [
									{
										displayName: "From List",
										name: "list",
										type: "list",
										typeOptions: {
											searchListMethod: "searchTaskTags",
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
								description: "The tag to add to the task",
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
				description:
					"Tags to add to the task. Existing tags are preserved unless removed. (V2 API only)",
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

/** Subtask input from n8n form */
interface SubtaskInput {
	title?: string;
	isAllDay?: boolean;
	completedTime?: string;
	sortOrder?: number | string;
	startDate?: string;
	status?: number;
	timeZone?: string;
}

export function buildSubtask(sub: SubtaskInput): Partial<ChecklistItem> {
	const subtask: Partial<ChecklistItem> = {};
	if (sub.completedTime) {
		subtask.completedTime = formatTickTickDate(sub.completedTime);
	}
	if (sub.isAllDay !== undefined) subtask.isAllDay = sub.isAllDay;
	if (sub.sortOrder !== undefined && sub.sortOrder !== "") {
		subtask.sortOrder = sub.sortOrder as number;
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
			ENDPOINTS.OPEN_V1_TASK_ALL(taskId),
		);
	} catch {
		return {};
	}
}

/** Task update fields from the n8n form */
interface TaskUpdateFields {
	isAllDay?: boolean;
	clearFields?: string[];
	completedTime?: string;
	content?: string;
	desc?: string;
	dueDate?: string;
	items?: {
		item?: SubtaskInput[];
	};
	priority?: number;
	reminders?: string;
	removeTags?: {
		tagValues?: Array<{ tag: string | ResourceLocatorValue }>;
	};
	repeatFlag?: string;
	sortOrder?: number;
	startDate?: string;
	status?: number;
	tags?: {
		tagValues?: Array<{ tag: string | ResourceLocatorValue }>;
	};
	timeZone?: string;
	title?: string;
}

export function applyClearFields(
	body: TaskBody,
	clearFields: string[],
): void {
	const dateFields = ["dueDate", "startDate", "completedTime"];
	for (const field of clearFields) {
		if (field === "tags") {
			continue;
		} else if (field === "reminders") {
			body.reminders = [];
		} else if (dateFields.includes(field)) {
			(body as Record<string, unknown>)[field] = null;
		} else {
			(body as Record<string, unknown>)[field] = "";
		}
	}
}

export function applyTagChanges(
	body: TaskBody,
	currentTask: IDataObject,
	updateFields: TaskUpdateFields,
	clearFields: string[],
): void {
	const currentTags: string[] = clearFields.includes("tags")
		? []
		: ((currentTask.tags as string[]) || []);
	let finalTags = [...currentTags];
	let tagsModified = clearFields.includes("tags");

	if (
		updateFields.removeTags?.tagValues &&
		Array.isArray(updateFields.removeTags.tagValues) &&
		updateFields.removeTags.tagValues.length > 0
	) {
		const tagsToRemove = updateFields.removeTags.tagValues
			.map((item) => extractTagValue(item.tag))
			.filter((tag: string) => tag && tag.trim() !== "");

		if (tagsToRemove.length > 0) {
			finalTags = finalTags.filter((tag) => !tagsToRemove.includes(tag));
			tagsModified = true;
		}
	}

	if (
		updateFields.tags?.tagValues &&
		Array.isArray(updateFields.tags.tagValues) &&
		updateFields.tags.tagValues.length > 0
	) {
		const tagsToAdd = updateFields.tags.tagValues
			.map((item) => extractTagValue(item.tag))
			.filter(
				(tag: string) => tag && tag.trim() !== "" && !finalTags.includes(tag),
			);

		if (tagsToAdd.length > 0) {
			finalTags = [...finalTags, ...tagsToAdd];
			tagsModified = true;
		}
	}

	if (tagsModified) {
		body.tags = finalTags;
	}
}

export function buildTaskBody(
	currentTask: IDataObject,
	updateFields: TaskUpdateFields,
	taskId: string,
	projectId: string,
): TaskBody {
	const body: TaskBody = { ...(currentTask as unknown as TaskBody) };

	body.id = taskId;
	body.projectId = projectId || (currentTask.projectId as string) || "inbox";

	const clearFields = updateFields.clearFields || [];
	if (clearFields.length > 0) {
		applyClearFields(body, clearFields);
	}

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
	] as const;

	for (const field of directFields) {
		if (clearFields.includes(field)) {
			continue;
		}
		const value = updateFields[field as keyof TaskUpdateFields];
		if (value !== undefined && value !== "" && value !== null) {
			(body as Record<string, unknown>)[field] = value;
		}
	}

	const dateFields = ["dueDate", "completedTime", "startDate"] as const;
	for (const field of dateFields) {
		if (clearFields.includes(field)) {
			continue;
		}
		const value = updateFields[field as keyof TaskUpdateFields] as
			| string
			| undefined;
		if (value) {
			(body as Record<string, unknown>)[field] = formatTickTickDate(value);
		}
	}

	applyTagChanges(body, currentTask, updateFields, clearFields);

	if (!clearFields.includes("reminders") && updateFields.reminders) {
		const reminders = parseReminders(updateFields.reminders);
		if (reminders.length > 0) {
			body.reminders = reminders;
		}
	}

	if (updateFields.items?.item && Array.isArray(updateFields.items.item)) {
		const subtasks = updateFields.items.item
			.map(buildSubtask)
			.filter((s) => Object.keys(s).length > 0);
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
		this.getNodeParameter("taskId", index) as string | ResourceLocatorValue,
	);
	const projectId = extractResourceLocatorValue(
		this.getNodeParameter("projectId", index, "") as
			| string
			| ResourceLocatorValue,
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

	let body: TaskBody;

	if (useJson) {
		const jsonString = this.getNodeParameter(
			"additionalFieldsJson",
			index,
			"{}",
		) as string;
		try {
			body = JSON.parse(jsonString) as TaskBody;
		} catch (error) {
			throw new Error(`Invalid JSON provided: ${(error as Error).message}`);
		}
	} else {
		const updateFields = this.getNodeParameter(
			"updateFields",
			index,
			{},
		) as TaskUpdateFields;
		body = buildTaskBody(currentTask, updateFields, taskId, projectId);
	}

	body.projectId ||= "inbox";
	body.id ||= taskId;
	body.title ||= currentTask.title as string;

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
		ENDPOINTS.OPEN_V1_TASK_UPDATE(taskId),
		body,
	);
	return [{ json: response }];
}
