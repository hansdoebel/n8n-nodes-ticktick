import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import { getProjects, searchProjects } from "@ticktick/GenericFunctions";
import { ENDPOINTS } from "@ticktick/constants/endpoints";

export const projectMethods = {
	loadOptions: {
		async getProjects(this: ILoadOptionsFunctions) {
			return await getProjects.call(this);
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
	},
};
