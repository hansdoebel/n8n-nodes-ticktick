import { validatePathParam } from "../helpers/utils";

export const ENDPOINTS = {
	TASKS: "/tasks",
	TASKS_BATCH: "/batch/task",

	HABITS: "/habits",
	HABITS_BATCH: "/habits/batch",
	HABIT_CHECKINS_BATCH: "/habitCheckins/batch",
	HABIT_SECTIONS: "/habitSections",

	PROJECTS: "/projects",
	PROJECTS_BATCH: "/batch/project",

	PROJECT_GROUPS: "/projectGroups",
	PROJECT_GROUPS_BATCH: "/batch/projectGroup",

	TAGS: "/tags",
	TAGS_BATCH: "/batch/tag",
	TAG: "/tag",
	TAG_RENAME: "/tag/rename",
	TAG_MERGE: "/tag/merge",

	PROJECT_ALL_CLOSED: "/project/all/closed",
	PROJECT_ALL_TRASH_PAGINATION: "/project/all/trash/pagination",
	PROJECT_ALL_COMPLETED: "/project/all/completed",

	OPEN_V1_PROJECT: "/open/v1/project",
	OPEN_V1_PROJECT_BY_ID: (projectId: string) =>
		`/open/v1/project/${validatePathParam(projectId, "projectId")}`,
	OPEN_V1_PROJECT_DATA: (projectId: string) =>
		`/open/v1/project/${validatePathParam(projectId, "projectId")}/data`,
	OPEN_V1_TASK: "/open/v1/task",
	OPEN_V1_TASK_UPDATE: (taskId: string) =>
		`/open/v1/task/${validatePathParam(taskId, "taskId")}`,
	OPEN_V1_TASK_ALL: (taskId: string) =>
		`/open/v1/project/all/task/${validatePathParam(taskId, "taskId")}`,
	OPEN_V1_TASK_BY_PROJECT: (projectId: string, taskId: string) =>
		`/open/v1/project/${validatePathParam(projectId, "projectId")}/task/${
			validatePathParam(taskId, "taskId")
		}`,
	OPEN_V1_TASK_COMPLETE: (projectId: string, taskId: string) =>
		`/open/v1/project/${validatePathParam(projectId, "projectId")}/task/${
			validatePathParam(taskId, "taskId")
		}/complete`,

	FOCUS_HEATMAP: (start: string, end: string) =>
		`/pomodoros/statistics/heatmap/${validatePathParam(start, "startDate")}/${
			validatePathParam(end, "endDate")
		}`,
	FOCUS_DISTRIBUTION: (start: string, end: string) =>
		`/pomodoros/statistics/dist/${validatePathParam(start, "startDate")}/${
			validatePathParam(end, "endDate")
		}`,

	SYNC: "/batch/check/0",

	USER_PROFILE: "/user/profile",
	USER_STATUS: "/user/status",
	USER_PREFERENCES_SETTINGS: "/user/preferences/settings",

	PROJECT_USERS: (projectId: string) =>
		`/project/${validatePathParam(projectId, "projectId")}/users`,
	TASK_ASSIGN: "/task/assign",
	TASK_PROJECT: "/batch/taskProject",
	TASK_PARENT: "/batch/taskParent",
} as const;
