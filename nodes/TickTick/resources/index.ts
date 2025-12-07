import { taskFields, taskOperations } from "./tasks/TasksDescription";
import {
	projectFields,
	projectOperations,
} from "./projects/ProjectsDescription";

export const ticktickResources = {
	task: {
		operations: taskOperations,
		fields: taskFields,
	},
	project: {
		operations: projectOperations,
		fields: projectFields,
	},
};
