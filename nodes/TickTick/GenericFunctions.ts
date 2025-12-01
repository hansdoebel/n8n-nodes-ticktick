import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from "n8n-workflow";

import { NodeApiError } from "n8n-workflow";
import { DateTime } from "luxon";

interface Project {
	id: string;
	name: string;
	color: string;
	closed: boolean;
	groupId: string;
	viewMode: string;
	permission: string;
	kind: string;
}

export async function getInboxProjectId(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const endpoint = "/open/v1/project/inbox/data";

	try {
		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			endpoint,
		)) as IDataObject;

		const tasks = (responseData.tasks as IDataObject[]) || [];
		const columns = (responseData.columns as IDataObject[]) || [];

		if (tasks.length > 0 && typeof tasks[0].projectId === "string") {
			return tasks[0].projectId as string;
		}

		if (columns.length > 0 && typeof columns[0].projectId === "string") {
			return columns[0].projectId as string;
		}

		throw new NodeApiError(this.getNode(), {
			message:
				"Could not determine Inbox project ID from /open/v1/project/inbox/data response.",
		});
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getProjects(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	const endpoint = "/open/v1/project";

	try {
		const responseData: Project[] = await tickTickApiRequest.call(
			this,
			"GET",
			endpoint,
		);

		const options = responseData.map((project: Project) => ({
			name: project.name,
			value: project.id,
		}));

		const resource = this.getCurrentNodeParameter("resource") as string;
		const operation = this.getCurrentNodeParameter("operation") as string;

		if (
			resource === "task"
		) {
			options.unshift({
				name: "Inbox",
				value: "",
			});
		} else if (resource === "project" && operation === "get") {
			options.unshift({
				name: "Inbox",
				value: "inbox",
			});
		}

		return options;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getTasks(
	this: ILoadOptionsFunctions,
	projectId: string,
): Promise<{ name: string; value: string }[]> {
	if (!projectId) {
		projectId = "inbox";
	}

	const endpoint = `/open/v1/project/${projectId}/data`;

	try {
		const responseData =
			(await tickTickApiRequest.call(this, "GET", endpoint)) as IDataObject;

		const tasks = responseData.tasks as IDataObject[];

		return tasks.map((task) => ({
			name: task.title as string,
			value: (task.id as string | number | boolean).toString(),
		}));
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function tickTickApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const authentication = this.getNodeParameter("authentication", 0) as string;

	const baseUrl = "https://ticktick.com";

	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length) {
		options.body = body;
	}

	try {
		let responseData;

		if (authentication === "tickTickOAuth2Api") {
			responseData = await this.helpers.requestOAuth2!.call(
				this,
				"tickTickOAuth2Api",
				options,
			);
		} else if (authentication === "tickTickTokenApi") {
			responseData = await this.helpers.requestWithAuthentication!.call(
				this,
				"tickTickTokenApi",
				options,
			);
		} else {
			throw new NodeApiError(this.getNode(), {
				message: `Unknown authentication method: ${authentication}`,
			});
		}

		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export const TimeZones = [
	{ name: "UTC", value: "UTC" },
	{ name: "Europe/London", value: "Europe/London" },
	{ name: "Europe/Berlin", value: "Europe/Berlin" },
	{ name: "Europe/Moscow", value: "Europe/Moscow" },
	{ name: "Asia/Kolkata", value: "Asia/Kolkata" },
	{ name: "Asia/Shanghai", value: "Asia/Shanghai" },
	{ name: "Asia/Tokyo", value: "Asia/Tokyo" },
	{ name: "America/New_York", value: "America/New_York" },
	{ name: "America/Chicago", value: "America/Chicago" },
	{ name: "America/Denver", value: "America/Denver" },
	{ name: "America/Los_Angeles", value: "America/Los_Angeles" },
	{ name: "America/Sao_Paulo", value: "America/Sao_Paulo" },
	{ name: "Australia/Sydney", value: "Australia/Sydney" },
	{ name: "Pacific/Auckland", value: "Pacific/Auckland" },
];

export function formatTickTickDate(dateString: string): string | undefined {
	if (!dateString) {
		return undefined;
	}

	const date = DateTime.fromISO(dateString);

	const dateTimePart = date.toFormat("yyyy-MM-dd'T'HH:mm:ss");

	// Manually format the timezone offset - Luxon by default puts a ":" in the date offset part, this format cannot be processed by TickTick
	// See https://developer.ticktick.com/api#/openapi?id=create-task
	const offsetSign = date.offset >= 0 ? "+" : "-";
	const offsetHours = String(Math.floor(Math.abs(date.offset) / 60)).padStart(
		2,
		"0",
	);
	const offsetMinutes = String(Math.abs(date.offset) % 60).padStart(2, "0");
	const timezonePart = `${offsetSign}${offsetHours}${offsetMinutes}`;

	return `${dateTimePart}${timezonePart}`;
}
