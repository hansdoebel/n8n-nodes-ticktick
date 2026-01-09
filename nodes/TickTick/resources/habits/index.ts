import type { ResourceDefinition } from "../../types/registry";
import { habitFields, habitOperations } from "./HabitsDescription";
import * as operations from "./operations";
import { habitMethods } from "./methods";

export const habitResource: ResourceDefinition = {
	name: "habit",
	operations: habitOperations,
	fields: habitFields,
	handlers: {
		list: operations.habitListExecute,
		get: operations.habitGetExecute,
		create: operations.habitCreateExecute,
		update: operations.habitUpdateExecute,
		delete: operations.habitDeleteExecute,
		checkin: operations.habitCheckinExecute,
		archive: operations.habitArchiveExecute,
		unarchive: operations.habitUnarchiveExecute,
	},
	methods: habitMethods,
};

export * from "./HabitsDescription";
export * from "./operations";
