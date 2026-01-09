import type { ILoadOptionsFunctions } from "n8n-workflow";
import { getTasks } from "@ticktick/helpers";

export const taskMethods = {
	loadOptions: {
		async getTasks(this: ILoadOptionsFunctions) {
			const projectId = this.getCurrentNodeParameter("projectId") as string;
			return await getTasks.call(this, projectId);
		},
	},
};
