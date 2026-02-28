import type { ResourceDefinition } from "../../helpers/types";
import { syncFields, syncOperations } from "./SyncDescription";
import * as operations from "./operations";

export const syncResource: ResourceDefinition = {
	name: "sync",
	operations: syncOperations,
	fields: syncFields,
	handlers: {
		syncAll: operations.syncAllExecute,
	},
};

export * from "./SyncDescription";
export * from "./operations";
