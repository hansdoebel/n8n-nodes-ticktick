import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import {
	getProjectGroups,
	getProjects,
	searchProjectGroups,
	searchProjectGroupsForCreate,
	searchProjects,
	searchProjectsForDelete,
	searchSharedProjects,
} from "@ticktick/helpers";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectMethods = {
	loadOptions: {
		async getProjects(this: ILoadOptionsFunctions) {
			return await getProjects.call(this);
		},
		async getProjectGroups(this: ILoadOptionsFunctions) {
			return await getProjectGroups.call(this);
		},
	},
	listSearch: {
		async searchProjects(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjects.call(this, filter);
			return { results };
		},
		async searchProjectsForDelete(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectsForDelete.call(this, filter);
			return { results };
		},
		async searchProjectsForMove(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjects.call(this, filter);

			try {
				const taskIdValue = this.getCurrentNodeParameter("taskId") as
					| string
					| { mode: string; value: string };

				let taskId: string;
				if (typeof taskIdValue === "object" && taskIdValue !== null) {
					taskId = taskIdValue.value || "";
				} else {
					taskId = taskIdValue || "";
				}

				if (taskId) {
					const authType = this.getCurrentNodeParameter(
						"authentication",
					) as string;

					if (authType === "tickTickSessionApi") {
						const { tickTickApiRequestV2 } = await import(
							"../../helpers/apiRequest"
						);
						const syncResponse = (await tickTickApiRequestV2.call(
							this,
							"GET",
							ENDPOINTS.SYNC,
						)) as any;

						const tasks = syncResponse?.syncTaskBean?.update || [];
						const task = tasks.find((t: any) => String(t.id) === taskId);

						if (task && task.projectId) {
							return {
								results: results.filter((r) => r.value !== task.projectId),
							};
						}
					}
				}
			} catch (error) {
			}

			return { results };
		},
		async searchSharedProjects(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchSharedProjects.call(this, filter);
			return { results };
		},
		async searchProjectGroups(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectGroups.call(this, filter);
			return { results };
		},
		async searchProjectGroupsForCreate(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectGroupsForCreate.call(this, filter);
			return { results };
		},
		async searchProjectGroupsForUpdate(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchProjectGroups.call(this, filter);

			try {
				const projectIdValue = this.getCurrentNodeParameter("projectId") as
					| string
					| { mode: string; value: string };

				let projectId: string;
				if (typeof projectIdValue === "object" && projectIdValue !== null) {
					projectId = projectIdValue.value || "";
				} else {
					projectId = projectIdValue || "";
				}

				if (projectId) {
					const authType = this.getCurrentNodeParameter(
						"authentication",
					) as string;

					if (authType === "tickTickSessionApi") {
						const { tickTickApiRequestV2 } = await import(
							"../../helpers/apiRequest"
						);
						const syncResponse = (await tickTickApiRequestV2.call(
							this,
							"GET",
							ENDPOINTS.SYNC,
						)) as any;

						const projects = syncResponse?.projectProfiles || [];
						const project = projects.find((p: any) =>
							String(p.id) === projectId
						);

						if (project && project.groupId) {
							return {
								results: results.filter((r) => r.value !== project.groupId),
							};
						}
					}
				}
			} catch (error) {
			}

			return { results };
		},
	},
};
