import type { ResourceDefinition } from "../../types/registry";
import { focusFields, focusOperations } from "./FocusDescription";
import * as operations from "./operations";

export const focusResource: ResourceDefinition = {
	name: "focus",
	operations: focusOperations,
	fields: focusFields,
	handlers: {
		getHeatmap: operations.focusGetHeatmapExecute,
		getDistribution: operations.focusGetDistributionExecute,
	},
};

export * from "./FocusDescription";
export * from "./operations";
