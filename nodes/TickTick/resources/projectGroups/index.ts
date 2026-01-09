import type { ResourceDefinition } from "../../types/registry";
import {
	projectGroupFields,
	projectGroupOperations,
} from "./ProjectGroupsDescription";
import * as operations from "./operations";

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
};

export * from "./ProjectGroupsDescription";
export * from "./operations";
