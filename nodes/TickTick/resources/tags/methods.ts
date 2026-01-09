import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import { getTags, searchTags } from "@ticktick/GenericFunctions";

export const tagMethods = {
	loadOptions: {
		async getTags(this: ILoadOptionsFunctions) {
			return await getTags.call(this);
		},
	},
	listSearch: {
		async searchTags(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchTags.call(this, filter);
			return { results };
		},
	},
};
