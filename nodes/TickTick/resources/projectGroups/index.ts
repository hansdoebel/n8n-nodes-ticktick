import type { ResourceDefinition } from "../../types/registry";
import {
	projectGroupFields,
	projectGroupOperations,
} from "./ProjectGroupsDescription";
import * as operations from "./operations";
import { projectGroupMethods } from "./methods";

export const projectGroupResource: ResourceDefinition = {
	name: "projectGroup",
	operations: projectGroupOperations,
	fields: projectGroupFields,
	handlers: {
		list: operations.projectGroupListExecute,
		create: operations.projectGroupCreateExecute,
		update: operations.projectGroupUpdateExecute,
		delete: operations.projectGroupDeleteExecute,
	},
	methods: projectGroupMethods,
};

export * from "./ProjectGroupsDescription";
export * from "./operations";
