import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import { searchTasks } from "@ticktick/helpers";

export const sharedMethods = {
	listSearch: {
		async searchTasks(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchTasks.call(this, filter);
			return { results };
		},
	},
};
