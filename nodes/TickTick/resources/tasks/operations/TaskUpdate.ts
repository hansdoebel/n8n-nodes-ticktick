import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
	TimeZones,
} from "@ticktick/GenericFunctions";
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

export async function taskUpdateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	function setIfDefined(target: Record<string, any>, key: string, value: any) {
		if (value !== undefined && value !== "" && value !== null) {
			target[key] = value;
		}
	}

	const taskIdValue = this.getNodeParameter("taskId", index) as
		| string
		| { mode: string; value: string };
	const projectIdValue = this.getNodeParameter("projectId", index, "") as
		| string
		| { mode: string; value: string };

	let taskId: string;
	let projectIdParam: string;

	if (typeof taskIdValue === "object" && taskIdValue !== null) {
		taskId = taskIdValue.value || "";
	} else {
		taskId = taskIdValue || "";
	}

	if (typeof projectIdValue === "object" && projectIdValue !== null) {
		projectIdParam = projectIdValue.value || "";
	} else {
		projectIdParam = projectIdValue || "";
	}

	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: Record<string, any> = {};

	let currentTask: any = {};
	const useV2 = isV2Auth(this, index);

	if (useV2) {
		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;
		const tasks =
			((response.syncTaskBean as IDataObject)?.update || []) as IDataObject[];
		const task = tasks.find((t) => String(t.id) === taskId);
		if (task) {
			currentTask = task;
		}
	} else {
		try {
			currentTask = await tickTickApiRequest.call(
				this,
				"GET",
				`/open/v1/project/all/task/${taskId}`,
			);
		} catch (error) {}
	}

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

		const cleaned: Record<string, any> = {
			...currentTask,
		};

		cleaned.id = taskId;
		cleaned.projectId = projectIdParam && projectIdParam !== ""
			? projectIdParam
			: currentTask.projectId || "inbox";

		setIfDefined(cleaned, "content", updateFields.content);
		setIfDefined(cleaned, "desc", updateFields.desc);
		setIfDefined(
			cleaned,
			"dueDate",
			formatTickTickDate(updateFields.dueDate),
		);
		setIfDefined(cleaned, "isAllDay", updateFields.isAllDay);
		setIfDefined(
			cleaned,
			"completedTime",
			formatTickTickDate(updateFields.completedTime),
		);
		setIfDefined(cleaned, "priority", updateFields.priority);
		setIfDefined(cleaned, "repeatFlag", updateFields.repeatFlag);
		setIfDefined(cleaned, "sortOrder", updateFields.sortOrder);
		setIfDefined(
			cleaned,
			"startDate",
			formatTickTickDate(updateFields.startDate),
		);
		setIfDefined(cleaned, "status", updateFields.status);
		setIfDefined(cleaned, "timeZone", updateFields.timeZone);
		setIfDefined(cleaned, "title", updateFields.title);

		if (updateFields.reminders) {
			try {
				const reminders = (updateFields.reminders as string)
					.split(",")
					.map((r) => r.trim())
					.filter((r) => r.length > 0);
				if (reminders.length > 0) {
					cleaned.reminders = reminders;
				}
			} catch (error) {}
		}

		if (updateFields.items?.item && Array.isArray(updateFields.items.item)) {
			const subtasks = updateFields.items.item
				.map((sub: Record<string, any>) => {
					const subtask: Record<string, any> = {};
					if (sub.completedTime) {
						subtask.completedTime = formatTickTickDate(sub.completedTime);
					}
					if (sub.isAllDay !== undefined) {
						subtask.isAllDay = sub.isAllDay;
					}
					if (sub.sortOrder !== undefined && sub.sortOrder !== "") {
						subtask.sortOrder = sub.sortOrder;
					}
					if (sub.startDate) {
						subtask.startDate = formatTickTickDate(sub.startDate);
					}
					if (sub.status !== undefined) {
						subtask.status = sub.status;
					}
					if (sub.timeZone) {
						subtask.timeZone = sub.timeZone;
					}
					if (sub.title !== undefined && sub.title !== "") {
						subtask.title = sub.title;
					}
					return subtask;
				})
				.filter((s: Record<string, any>) => Object.keys(s).length > 0);

			if (subtasks.length > 0) {
				cleaned.items = subtasks;
			}
		}

		body = cleaned;
	}

	if (!body.projectId) {
		body.projectId = "inbox";
	}
	if (!body.id) {
		body.id = taskId;
	}
	if (!body.title && currentTask.title) {
		body.title = currentTask.title;
	}

	if (useV2) {
		const batchBody = {
			update: [body],
		};
		const response = await tickTickApiRequestV2.call(
			this,
			"POST",
			ENDPOINTS.TASKS_BATCH,
			batchBody,
		);
		return [{ json: response }];
	}

	const endpoint = `/open/v1/task/${taskId}`;
	const response = await tickTickApiRequest.call(this, "POST", endpoint, body);
	return [{ json: response }];
}
