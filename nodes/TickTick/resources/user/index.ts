import type { ResourceDefinition } from "../../types/registry";
import { userFields, userOperations } from "./UserDescription";
import * as operations from "./operations";

export const userResource: ResourceDefinition = {
	name: "user",
	operations: userOperations,
	fields: userFields,
	handlers: {
		getProfile: operations.userGetProfileExecute,
		getStatus: operations.userGetStatusExecute,
		getPreferences: operations.userGetPreferencesExecute,
	},
};

export * from "./UserDescription";
export * from "./operations";
