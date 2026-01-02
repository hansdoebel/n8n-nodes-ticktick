import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import {
	getAuthenticationType,
	tickTickApiRequest,
	tickTickApiRequestV2,
} from "./apiRequest";

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

		const inboxProject = projects.find(
			(p) => p.kind === "inbox" || p.name.toLowerCase().includes("inbox"),
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

		try {
			const operation = this.getCurrentNodeParameter("operation") as string;

			if (operation !== "delete") {
				options.unshift({ name: "Inbox", value: "" });
			}
		} catch (paramError) {
			options.unshift({ name: "Inbox", value: "" });
		}

		return options;
	} catch (error) {
		try {
			const operation = this.getCurrentNodeParameter("operation") as string;
			if (operation !== "delete") {
				return [{ name: "Inbox", value: "" }];
			}
		} catch (e) {}
		return [];
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

/**
 * Get all habits (V2 API only)
 */
export async function getHabits(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const habits =
			(await tickTickApiRequestV2.call(this, "GET", "/habits")) as Array<{
				id: string;
				name: string;
				status?: number;
			}>;

		if (!Array.isArray(habits)) {
			return [];
		}

		return habits
			.filter((habit) => habit && habit.id && habit.name)
			.map((habit) => ({
				name: habit.name,
				value: habit.id,
			}));
	} catch (error) {
		return [];
	}
}

/**
 * Get all tags (V2 API only)
 */
export async function getTags(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", "/batch/check/0")) as {
				tags?: Array<{ name: string; label?: string }>;
			};

		const tags = response.tags || [];

		if (!Array.isArray(tags)) {
			return [];
		}

		return tags
			.filter((tag) => tag && tag.name)
			.map((tag) => ({
				name: tag.label || tag.name,
				value: tag.name,
			}));
	} catch (error) {
		return [];
	}
}

/**
 * Get all project groups/folders (V2 API only)
 */
export async function getProjectGroups(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", "/batch/check/0")) as {
				projectGroups?: Array<{ id: string; name: string }>;
			};

		const projectGroups = response.projectGroups || [];

		if (!Array.isArray(projectGroups)) {
			return [];
		}

		return projectGroups
			.filter((group) => group && group.id && group.name)
			.map((group) => ({
				name: group.name,
				value: group.id,
			}));
	} catch (error) {
		return [];
	}
}
