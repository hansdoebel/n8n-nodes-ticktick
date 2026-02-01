import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from "n8n-workflow";
import { getTags, searchParentTags, searchTags } from "@ticktick/helpers";

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
		async searchParentTags(
			this: ILoadOptionsFunctions,
			filter?: string,
		): Promise<INodeListSearchResult> {
			const results = await searchParentTags.call(this, filter);
			return { results };
		},
	},
};
