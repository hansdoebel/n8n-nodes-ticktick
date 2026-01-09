import type { ResourceDefinition } from "../../types/registry";
import { projectFields, projectOperations } from "./ProjectsDescription";
import * as operations from "./operations";

export const projectResource: ResourceDefinition = {
	name: "project",
	operations: projectOperations,
	fields: projectFields,
	handlers: {
		create: operations.projectCreateExecute,
		get: operations.projectGetExecute,
		update: operations.projectUpdateExecute,
		delete: operations.projectDeleteExecute,
	},
};

export * from "./ProjectsDescription";
export * from "./operations";
