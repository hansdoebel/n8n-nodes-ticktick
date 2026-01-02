import { taskFields, taskOperations } from "./tasks/TasksDescription";
import {
	projectFields,
	projectOperations,
} from "./projects/ProjectsDescription";
import { tagFields, tagOperations } from "./tags/TagsDescription";
import { habitFields, habitOperations } from "./habits/HabitsDescription";
import { focusFields, focusOperations } from "./focus/FocusDescription";
import {
	projectGroupFields,
	projectGroupOperations,
} from "./projectGroups/ProjectGroupsDescription";
import { userFields, userOperations } from "./user/UserDescription";
import { syncFields, syncOperations } from "./sync/SyncDescription";

export const ticktickResources = {
	task: {
		operations: taskOperations,
		fields: taskFields,
	},
	project: {
		operations: projectOperations,
		fields: projectFields,
	},
	tag: {
		operations: tagOperations,
		fields: tagFields,
	},
	habit: {
		operations: habitOperations,
		fields: habitFields,
	},
	focus: {
		operations: focusOperations,
		fields: focusFields,
	},
	projectGroup: {
		operations: projectGroupOperations,
		fields: projectGroupFields,
	},
	user: {
		operations: userOperations,
		fields: userFields,
	},
	sync: {
		operations: syncOperations,
		fields: syncFields,
	},
};
