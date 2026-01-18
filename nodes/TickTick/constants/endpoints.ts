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
	OPEN_V1_TASK: "/open/v1/task",

	FOCUS_HEATMAP: (start: string, end: string) =>
		`/pomodoros/statistics/heatmap/${start}/${end}`,
	FOCUS_DISTRIBUTION: (start: string, end: string) =>
		`/pomodoros/statistics/dist/${start}/${end}`,

	SYNC: "/batch/check/0",

	USER_PROFILE: "/user/profile",
	USER_STATUS: "/user/status",
	USER_PREFERENCES_SETTINGS: "/user/preferences/settings",

	PROJECT_USERS: (projectId: string) => `/project/${projectId}/users`,
	TASK_ASSIGN: "/task/assign",
} as const;
