import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import { tickTickApiRequest } from "./apiRequest";

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
	try {
		const projects = (await tickTickApiRequest.call(
			this,
			"GET",
			"/open/v1/project",
		)) as Project[];

		const inboxProject = projects.find((p) =>
			p.kind === "inbox" || p.name.toLowerCase().includes("inbox")
		);
		return inboxProject?.id || "inbox";
	} catch (error) {
		return "inbox";
	}
}

export async function getProjects(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	const endpoint = "/open/v1/project";
	try {
		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			endpoint,
		)) as Project[];

		if (!Array.isArray(responseData)) {
			throw new Error("API response is not an array of projects");
		}

		const options = responseData
			.filter((project: Project) => project && project.id && project.name)
			.map((project: Project) => ({
				name: project.name,
				value: project.id,
			}));

		options.unshift({ name: "Inbox", value: "" });

		return options;
	} catch (error) {
		return [{ name: "Inbox", value: "" }];
	}
}

export async function getTasks(
	this: ILoadOptionsFunctions,
	projectId?: string,
): Promise<{ name: string; value: string }[]> {
	const actualProjectId = !projectId || projectId === "" ? "inbox" : projectId;

	const endpoint = `/open/v1/project/${actualProjectId}/data`;

	try {
		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			endpoint,
		)) as IDataObject;

		const tasks = responseData.tasks as IDataObject[];

		if (!Array.isArray(tasks)) {
			return [];
		}

		return tasks
			.filter((task) => task && task.id && task.title)
			.map((task) => ({
				name: task.title as string,
				value: String(task.id),
			}));
	} catch (error) {
		return [];
	}
}
