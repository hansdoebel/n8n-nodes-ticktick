import type { ResourceDefinition } from "../../types/registry";
import { tagFields, tagOperations } from "./TagsDescription";
import * as operations from "./operations";
import { tagMethods } from "./methods";

export const tagResource: ResourceDefinition = {
	name: "tag",
	operations: tagOperations,
	fields: tagFields,
	handlers: {
		list: operations.tagListExecute,
		create: operations.tagCreateExecute,
		update: operations.tagUpdateExecute,
		delete: operations.tagDeleteExecute,
		rename: operations.tagRenameExecute,
		merge: operations.tagMergeExecute,
	},
	methods: tagMethods,
};

export * from "./TagsDescription";
export * from "./operations";
