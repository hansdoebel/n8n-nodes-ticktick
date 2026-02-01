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
import { ENDPOINTS } from "@ticktick/constants/endpoints";

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
			ENDPOINTS.OPEN_V1_PROJECT,
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
	const authType = getAuthenticationType(this);

	if (authType === "tickTickSessionApi") {
		return await searchProjectsV2.call(this);
	}

	try {
		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			ENDPOINTS.OPEN_V1_PROJECT,
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
			options.unshift({ name: "Inbox", value: "" });
		} catch (paramError) {
			options.unshift({ name: "Inbox", value: "" });
		}

		return options;
	} catch (error) {
		try {
			return [{ name: "Inbox", value: "" }];
		} catch (e) {}
		return [];
	}
}

export async function searchProjects(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);

		if (authType === "tickTickSessionApi") {
			return await searchProjectsV2.call(this, filter);
		}

		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			ENDPOINTS.OPEN_V1_PROJECT,
		)) as Project[];

		if (!Array.isArray(responseData)) {
			throw new Error("API response is not an array of projects");
		}

		let options = responseData
			.filter((project: Project) => project && project.id && project.name)
			.map((project: Project) => ({
				name: project.name,
				value: project.id,
			}));

		try {
			options.unshift({ name: "Inbox", value: "" });
		} catch (paramError) {
			options.unshift({ name: "Inbox", value: "" });
		}

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		try {
			return [{ name: "Inbox", value: "" }];
		} catch (e) {}
		return [];
	}
}

export async function searchProjectsV2(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const projects = response.projectProfiles as Array<
			{ id: string; name: string }
		>;

		if (!Array.isArray(projects)) {
			return [];
		}

		let options = projects
			.filter((project) => project && project.id && project.name)
			.map((project) => ({
				name: project.name,
				value: project.id,
			}));

		try {
			const inboxId = response.inboxId as string;
			options.unshift({ name: "Inbox", value: inboxId || "" });
		} catch (paramError) {
			const inboxId = response.inboxId as string;
			options.unshift({ name: "Inbox", value: inboxId || "" });
		}

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchProjectsForDelete(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);

		if (authType === "tickTickSessionApi") {
			const response = (await tickTickApiRequestV2.call(
				this,
				"GET",
				ENDPOINTS.SYNC,
			)) as IDataObject;

			const projects = response.projectProfiles as Array<
				{ id: string; name: string }
			>;

			if (!Array.isArray(projects)) {
				return [];
			}

			let options = projects
				.filter((project) => project && project.id && project.name)
				.map((project) => ({
					name: project.name,
					value: project.id,
				}));

			if (filter) {
				const searchTerm = filter.toLowerCase();
				options = options.filter((option) =>
					option.name.toLowerCase().includes(searchTerm)
				);
			}

			return options;
		}

		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			ENDPOINTS.OPEN_V1_PROJECT,
		)) as Project[];

		if (!Array.isArray(responseData)) {
			throw new Error("API response is not an array of projects");
		}

		let options = responseData
			.filter((project: Project) => project && project.id && project.name)
			.map((project: Project) => ({
				name: project.name,
				value: project.id,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function getTasks(
	this: ILoadOptionsFunctions,
	projectId?: string,
): Promise<{ name: string; value: string }[]> {
	const authType = getAuthenticationType(this);

	if (authType === "tickTickSessionApi") {
		return await searchTasksV2.call(this);
	}

	const actualProjectId = !projectId || projectId === "" ? "inbox" : projectId;

	try {
		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			ENDPOINTS.OPEN_V1_PROJECT_DATA(actualProjectId),
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

export async function searchTasks(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);

		if (authType === "tickTickSessionApi") {
			return await searchTasksV2.call(this, filter);
		}

		const projectIdParam = this.getCurrentNodeParameter("projectId");
		let projectId = "";

		if (typeof projectIdParam === "object" && projectIdParam !== null) {
			projectId = (projectIdParam as { value: string }).value || "";
		} else {
			projectId = (projectIdParam as string) || "";
		}

		const actualProjectId = !projectId || projectId === ""
			? "inbox"
			: projectId;

		const responseData = (await tickTickApiRequest.call(
			this,
			"GET",
			ENDPOINTS.OPEN_V1_PROJECT_DATA(actualProjectId),
		)) as IDataObject;

		const tasks = responseData.tasks as IDataObject[];

		if (!Array.isArray(tasks)) {
			return [];
		}

		let options = tasks
			.filter((task) => task && task.id && task.title)
			.map((task) => ({
				name: task.title as string,
				value: String(task.id),
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchTasksV2(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const projectIdParam = this.getCurrentNodeParameter("projectId");
		let projectId = "";

		if (typeof projectIdParam === "object" && projectIdParam !== null) {
			projectId = (projectIdParam as { value: string }).value || "";
		} else {
			projectId = (projectIdParam as string) || "";
		}

		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const tasks = (response.syncTaskBean as IDataObject)
			?.update as IDataObject[];

		if (!Array.isArray(tasks)) {
			return [];
		}

		let options = tasks
			.filter((task) => task && task.id && task.title)
			.filter((task) => {
				if (!projectId || projectId === "") {
					return true;
				}
				return task.projectId === projectId;
			})
			.map((task) => ({
				name: task.title as string,
				value: String(task.id),
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function getHabits(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const habits =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.HABITS)) as Array<
				{
					id: string;
					name: string;
					status?: number;
				}
			>;

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

export async function searchHabits(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const habits =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.HABITS)) as Array<
				{
					id: string;
					name: string;
					status?: number;
				}
			>;

		if (!Array.isArray(habits)) {
			return [];
		}

		let options = habits
			.filter((habit) => habit && habit.id && habit.name)
			.map((habit) => ({
				name: habit.name,
				value: habit.id,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function getTags(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
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

export async function searchTags(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
				tags?: Array<{ name: string; label?: string }>;
			};

		const tags = response.tags || [];

		if (!Array.isArray(tags)) {
			return [];
		}

		let options = tags
			.filter((tag) => tag && tag.name)
			.map((tag) => ({
				name: tag.label || tag.name,
				value: tag.name,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchParentTags(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		let currentTagName = "";
		try {
			const tagNameParam = this.getCurrentNodeParameter("tagName");
			if (typeof tagNameParam === "object" && tagNameParam !== null) {
				currentTagName = (tagNameParam as { value: string }).value || "";
			} else {
				currentTagName = (tagNameParam as string) || "";
			}
		} catch {
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
				tags?: Array<{ name: string; label?: string }>;
			};

		const tags = response.tags || [];

		if (!Array.isArray(tags)) {
			return [];
		}

		let options = tags
			.filter((tag) => tag && tag.name)
			.filter((tag) => tag.name !== currentTagName)
			.map((tag) => ({
				name: tag.label || tag.name,
				value: tag.name,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function getProjectGroups(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
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

export async function searchProjectGroups(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
				projectGroups?: Array<{ id: string; name: string }>;
			};

		const projectGroups = response.projectGroups || [];

		if (!Array.isArray(projectGroups)) {
			return [{ name: "None (Remove From Group)", value: "null" }];
		}

		let options = projectGroups
			.filter((group) => group && group.id && group.name)
			.map((group) => ({
				name: group.name,
				value: group.id,
			}));

		options.unshift({ name: "None (Remove From Group)", value: "null" });

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [{ name: "None (Remove From Group)", value: "null" }];
	}
}

export async function searchProjectGroupsForCreate(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response =
			(await tickTickApiRequestV2.call(this, "GET", ENDPOINTS.SYNC)) as {
				projectGroups?: Array<{ id: string; name: string }>;
			};

		const projectGroups = response.projectGroups || [];

		if (!Array.isArray(projectGroups)) {
			return [];
		}

		let options = projectGroups
			.filter((group) => group && group.id && group.name)
			.map((group) => ({
				name: group.name,
				value: group.id,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchProjectUsers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const projectIdParam = this.getCurrentNodeParameter("projectId");
		let projectId = "";

		if (typeof projectIdParam === "object" && projectIdParam !== null) {
			projectId = (projectIdParam as { value: string }).value || "";
		} else {
			projectId = (projectIdParam as string) || "";
		}

		if (!projectId) {
			return [];
		}

		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.PROJECT_USERS(projectId),
		)) as Array<{
			userId: number;
			displayName: string;
			username: string;
		}>;

		if (!Array.isArray(response)) {
			return [];
		}

		let options = response
			.filter((user) => user && user.userId)
			.map((user) => ({
				name: user.displayName || user.username || String(user.userId),
				value: String(user.userId),
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchSharedProjects(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const projects = response.projectProfiles as Array<{
			id: string;
			name: string;
			userCount?: number;
		}>;

		if (!Array.isArray(projects)) {
			return [];
		}

		let options = projects
			.filter((project) => project && project.id && project.name)
			.filter((project) => (project.userCount || 1) > 1)
			.map((project) => ({
				name: project.name,
				value: project.id,
			}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}

export async function searchTaskTags(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<{ name: string; value: string }[]> {
	try {
		const authType = getAuthenticationType(this);
		if (authType !== "tickTickSessionApi") {
			return [];
		}

		const taskIdParam = this.getCurrentNodeParameter("taskId");
		let taskId = "";

		if (typeof taskIdParam === "object" && taskIdParam !== null) {
			taskId = (taskIdParam as { value: string }).value || "";
		} else {
			taskId = (taskIdParam as string) || "";
		}

		if (!taskId) {
			return [];
		}

		const response = (await tickTickApiRequestV2.call(
			this,
			"GET",
			ENDPOINTS.SYNC,
		)) as IDataObject;

		const tasks = (response.syncTaskBean as IDataObject)
			?.update as IDataObject[];

		if (!Array.isArray(tasks)) {
			return [];
		}

		const task = tasks.find((t) => String(t.id) === taskId);

		if (!task || !task.tags || !Array.isArray(task.tags)) {
			return [];
		}

		let options = (task.tags as string[]).map((tag) => ({
			name: tag,
			value: tag,
		}));

		if (filter) {
			const searchTerm = filter.toLowerCase();
			options = options.filter((option) =>
				option.name.toLowerCase().includes(searchTerm)
			);
		}

		return options;
	} catch (error) {
		return [];
	}
}
