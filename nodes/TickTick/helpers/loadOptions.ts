import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";
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
	const endpoint = "/open/v1/project/inbox/data";
	try {
		const response =
			(await tickTickApiRequest.call(this, "GET", endpoint)) as IDataObject;
		const tasks = (response.tasks as IDataObject[]) || [];
		const columns = (response.columns as IDataObject[]) || [];

		const inferredId = (tasks[0]?.projectId as string) ||
			(columns[0]?.projectId as string);

		if (!inferredId) {
			throw new NodeApiError(this.getNode(), {
				message: "Unable to determine Inbox project ID from API response.",
			});
		}

		return inferredId;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function getProjects(
	this: ILoadOptionsFunctions,
): Promise<{ name: string; value: string }[]> {
	const endpoint = "/open/v1/project";
	try {
		const responseData =
			(await tickTickApiRequest.call(this, "GET", endpoint)) as Project[];

		const options = responseData.map((project: Project) => ({
			name: project.name,
			value: project.id,
		}));

		const resource = this.getCurrentNodeParameter("resource") as string;
		const operation = this.getCurrentNodeParameter("operation") as string;

		if (resource === "task") {
			options.unshift({ name: "Inbox", value: "" });
		} else if (resource === "project" && operation === "get") {
			options.unshift({ name: "Inbox", value: "inbox" });
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
	const id = projectId || "inbox";
	const endpoint = `/open/v1/project/${id}/data`;

	try {
		const responseData =
			(await tickTickApiRequest.call(this, "GET", endpoint)) as IDataObject;
		const tasks = responseData.tasks as IDataObject[];

		return tasks.map((task) => ({
			name: task.title as string,
			value: String(task.id),
		}));
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
