import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import {
	formatTickTickDate,
	tickTickApiRequest,
	TimeZones,
} from "@ticktick/GenericFunctions";
import { isV2Auth, tickTickApiRequestV2 } from "@helpers/apiRequest";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const taskCreateFields: INodeProperties[] = [
	{
		displayName: "Project",
		name: "projectId",
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		description: "The project to create the task in",
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
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "Title",
		name: "title",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["create"],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: "JSON Parameters",
		name: "jsonParameters",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["task"], operation: ["create"] } },
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
				operation: ["create"],
				jsonParameters: [true],
			},
		},
		description: "Raw JSON body to send directly to TickTick",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["task"],
				operation: ["create"],
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
				displayName: "Kind",
				name: "kind",
				type: "options",
				options: [
					{ name: "Text", value: "TEXT" },
					{ name: "Note", value: "NOTE" },
					{ name: "Checklist", value: "CHECKLIST" },
				],
				default: "TEXT",
				description: "Type of task",
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
		],
	},
];

export async function taskCreateExecute(
	this: IExecuteFunctions,
	index: number,
) {
	function setIfDefined(target: Record<string, any>, key: string, value: any) {
		if (value !== undefined && value !== "" && value !== null) {
			target[key] = value;
		}
	}

	const useJson = this.getNodeParameter(
		"jsonParameters",
		index,
		false,
	) as boolean;
	let body: Record<string, any> = {};

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
		const title = this.getNodeParameter("title", index) as string;
		const projectIdValue = this.getNodeParameter("projectId", index, "") as
			| string
			| { mode: string; value: string };
		const additional = this.getNodeParameter(
			"additionalFields",
			index,
			{},
		) as Record<string, any>;

		const cleaned: Record<string, any> = {};

		if (!title || title.trim() === "") {
			throw new Error("Task title is required");
		}

		let projectId: string;

		if (typeof projectIdValue === "object" && projectIdValue !== null) {
			projectId = projectIdValue.value || "";
		} else {
			projectId = projectIdValue || "";
		}

		if (projectId && projectId.trim() !== "") {
			cleaned.projectId = projectId;
		}

		setIfDefined(cleaned, "title", title);
		setIfDefined(cleaned, "isAllDay", additional.isAllDay);
		setIfDefined(
			cleaned,
			"completedTime",
			formatTickTickDate(additional.completedTime),
		);
		setIfDefined(cleaned, "content", additional.content);
		setIfDefined(cleaned, "desc", additional.desc);
		setIfDefined(cleaned, "dueDate", formatTickTickDate(additional.dueDate));
		setIfDefined(cleaned, "kind", additional.kind);
		setIfDefined(cleaned, "priority", additional.priority);
		setIfDefined(cleaned, "repeatFlag", additional.repeatFlag);
		setIfDefined(cleaned, "sortOrder", additional.sortOrder);
		setIfDefined(
			cleaned,
			"startDate",
			formatTickTickDate(additional.startDate),
		);
		setIfDefined(cleaned, "status", additional.status);
		setIfDefined(cleaned, "timeZone", additional.timeZone);

		if (additional.reminders) {
			try {
				const reminders = (additional.reminders as string)
					.split(",")
					.map((r) => r.trim())
					.filter((r) => r.length > 0);
				if (reminders.length > 0) {
					cleaned.reminders = reminders;
				}
			} catch (error) {}
		}

		if (additional.items?.item && Array.isArray(additional.items.item)) {
			const subtasks = additional.items.item
				.map((sub: Record<string, any>) => {
					const subtask: Record<string, any> = {};
					if (sub.title !== undefined && sub.title !== "") {
						subtask.title = sub.title;
					}
					if (sub.isAllDay !== undefined) {
						subtask.isAllDay = sub.isAllDay;
					}
					if (sub.completedTime) {
						subtask.completedTime = formatTickTickDate(sub.completedTime);
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
					return subtask;
				})
				.filter((s: Record<string, any>) => Object.keys(s).length > 0);

			if (subtasks.length > 0) {
				cleaned.items = subtasks;
			}
		}

		body = cleaned;
	}

	try {
		const useV2 = isV2Auth(this, index);

		if (useV2) {
			const batchBody = {
				add: [body],
			};
			const response = await tickTickApiRequestV2.call(
				this,
				"POST",
				ENDPOINTS.TASKS_BATCH,
				batchBody,
			);
			return [{ json: response }];
		}

		const response = await tickTickApiRequest.call(
			this,
			"POST",
			ENDPOINTS.OPEN_V1_TASK,
			body,
		);
		return [{ json: response }];
	} catch (error) {
		throw new Error(`Failed to create task: ${error.message}`);
	}
}
