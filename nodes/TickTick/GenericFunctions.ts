import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';


import { NodeApiError } from 'n8n-workflow';
import { DateTime } from 'luxon';

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

export async function getProjects(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	const endpoint = '/open/v1/project';
	try {
		const responseData: Project[] = await tickTickApiRequest.call(this, 'GET', endpoint);
		return responseData.map((project: Project) => ({
			name: project.name,
			value: project.id,
		}));
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getTasks(
	this: ILoadOptionsFunctions,
	projectId: string,
): Promise<{ name: string; value: string }[]> {
	if (!projectId) {
		return [];
	}

	const endpoint = `/open/v1/project/${projectId}/data`;
	try {
		const responseData = (await tickTickApiRequest.call(this, 'GET', endpoint)) as IDataObject;
		// Assuming tasks are part of the response and each task has a title (for name) and an id (for value)
		const tasks = responseData.tasks as IDataObject[];

		// Ensure 'value' is treated as a string to match the expected return type
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
	const baseUrl = 'https://ticktick.com';
	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	try {
		const responseData = await this.helpers.requestOAuth2?.call(this, 'tickTickOAuth2Api', options);

		return responseData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export const TimeZones = [
	{ name: 'UTC', value: 'UTC' },
	{ name: 'Europe/London', value: 'Europe/London' },
	{ name: 'Europe/Berlin', value: 'Europe/Berlin' },
	{ name: 'Europe/Moscow', value: 'Europe/Moscow' },
	{ name: 'Asia/Kolkata', value: 'Asia/Kolkata' },
	{ name: 'Asia/Shanghai', value: 'Asia/Shanghai' },
	{ name: 'Asia/Tokyo', value: 'Asia/Tokyo' },
	{ name: 'America/New_York', value: 'America/New_York' },
	{ name: 'America/Chicago', value: 'America/Chicago' },
	{ name: 'America/Denver', value: 'America/Denver' },
	{ name: 'America/Los_Angeles', value: 'America/Los_Angeles' },
	{ name: 'America/Sao_Paulo', value: 'America/Sao_Paulo' },
	{ name: 'Australia/Sydney', value: 'Australia/Sydney' },
	{ name: 'Pacific/Auckland', value: 'Pacific/Auckland' },
];

export function formatTickTickDate(dateString: string): string | undefined {
	if (!dateString) {
		return undefined;
	}

	const date = DateTime.fromISO(dateString);

	// Format the main part of the date object
	const dateTimePart = date.toFormat("yyyy-MM-dd'T'HH:mm:ss");

	// Manually format the timezone offset - Luxon by default puts a ":" in the date offset part, this format cannot be processed by TickTick
	// See https://developer.ticktick.com/api#/openapi?id=create-task
	const offsetSign = date.offset >= 0 ? '+' : '-';
	const offsetHours = String(Math.floor(Math.abs(date.offset) / 60)).padStart(2, '0');
	const offsetMinutes = String(Math.abs(date.offset) % 60).padStart(2, '0');
	const timezonePart = `${offsetSign}${offsetHours}${offsetMinutes}`;

	return `${dateTimePart}${timezonePart}`;
}
