import type { ResourceDefinition } from "../../types/registry";
import { taskFields, taskOperations } from "./TasksDescription";
import * as operations from "./operations";
import { taskMethods } from "./methods";

export const taskResource: ResourceDefinition = {
	name: "task",
	operations: taskOperations,
	fields: taskFields,
	handlers: {
		create: operations.taskCreateExecute,
		get: operations.taskGetExecute,
		listAll: operations.taskListAllExecute,
		update: operations.taskUpdateExecute,
		complete: operations.taskCompleteExecute,
		delete: operations.taskDeleteExecute,
		listCompleted: operations.taskListCompletedExecute,
		listDeleted: operations.taskListDeletedExecute,
		move: operations.taskMoveExecute,
	},
	methods: taskMethods,
};

export * from "./TasksDescription";
export * from "./operations";
