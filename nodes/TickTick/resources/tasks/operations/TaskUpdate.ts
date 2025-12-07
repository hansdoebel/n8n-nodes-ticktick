import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
	TimeZones,
} from "@ticktick/GenericFunctions";

export const taskUpdateFields: INodeProperties[] = [
	{
		displayName: "Project Name or ID",
		name: "projectId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. If not specified, the current project of the task will be preserved. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		typeOptions: { loadOptionsMethod: "getProjects" },
		default: "",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["update"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "Task Name or ID",
		name: "taskId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. If not specified, the current project of the task will be preserved. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		required: true,
		typeOptions: {
			loadOptionsMethod: "getTasks",
			loadOptionsDependsOn: ["projectId"],
		},
		default: "",
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

	const taskId = this.getNodeParameter("taskId", index) as string;
	const projectIdParam = this.getNodeParameter(
		"projectId",
		index,
		"",
	) as string;

	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: Record<string, any> = {};

	let currentTask: any = {};
	try {
		currentTask = await tickTickApiRequest.call(
			this,
			"GET",
			`/open/v1/project/all/task/${taskId}`,
		);
	} catch (error) {}

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

	const endpoint = `/open/v1/task/${taskId}`;
	const response = await tickTickApiRequest.call(this, "POST", endpoint, body);
	return [{ json: response }];
}
