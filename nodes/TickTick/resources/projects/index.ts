import type { ResourceDefinition } from "../../types/registry";
import { projectFields, projectOperations } from "./ProjectsDescription";
import * as operations from "./operations";
import { projectMethods } from "./methods";

export const projectResource: ResourceDefinition = {
	name: "project",
	operations: projectOperations,
	fields: projectFields,
	handlers: {
		create: operations.projectCreateExecute,
		get: operations.projectGetExecute,
		getUsers: operations.projectGetUsersExecute,
		update: operations.projectUpdateExecute,
		delete: operations.projectDeleteExecute,
	},
	methods: projectMethods,
};

export * from "./ProjectsDescription";
export * from "./operations";
