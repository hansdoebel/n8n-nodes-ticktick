import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import { getHabits, searchHabits } from "@ticktick/helpers";

export const habitMethods = {
	loadOptions: {
		async getHabits(this: ILoadOptionsFunctions) {
			return await getHabits.call(this);
		},
	},
	listSearch: {
		async searchHabits(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchHabits.call(this, filter);
			return { results };
		},
	},
};
