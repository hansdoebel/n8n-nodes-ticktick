import { validatePathParam } from "./utils";

export const TICKTICK_URLS = {
	BASE_URL: "https://ticktick.com",
	API_BASE_URL: "https://api.ticktick.com",
	OAUTH_AUTHORIZE: "https://ticktick.com/oauth/authorize",
	OAUTH_TOKEN: "https://ticktick.com/oauth/token",
} as const;

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

export const DEFAULT_HABIT_COLOR = "#97E38B";
export const DEFAULT_HABIT_ICON = "habit_daily_check_in";
export const DEFAULT_HABIT_TYPE = "Boolean";
export const DEFAULT_HABIT_UNIT = "Count";
export const DEFAULT_HABIT_GOAL = 1;
export const DEFAULT_HABIT_STEP = 0;
export const DEFAULT_HABIT_TARGET_DAYS = 0;
export const DEFAULT_HABIT_ENCOURAGEMENT = "";

export const DEFAULT_HABIT_REPEAT_RULE =
	"RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA";

export const TASK_STATUS = {
	NORMAL: 0,
	COMPLETED: 2,
	DELETED: 1,
} as const;

export const TASK_PRIORITY = {
	NONE: 0,
	LOW: 1,
	MEDIUM: 3,
	HIGH: 5,
} as const;

export const HABIT_STATUS = {
	ACTIVE: 0,
	ARCHIVED: 2,
} as const;

export const CHECKIN_STATUS = {
	COMPLETED: 2,
} as const;

export const TimeZones = [
	{ name: "America/Anchorage", value: "America/Anchorage" },
	{
		name: "America/Argentina/Buenos_Aires",
		value: "America/Argentina/Buenos_Aires",
	},
	{ name: "America/Chicago", value: "America/Chicago" },
	{ name: "America/Denver", value: "America/Denver" },
	{ name: "America/Los_Angeles", value: "America/Los_Angeles" },
	{ name: "America/Mexico_City", value: "America/Mexico_City" },
	{ name: "America/New_York", value: "America/New_York" },
	{ name: "America/Santiago", value: "America/Santiago" },
	{ name: "America/Sao_Paulo", value: "America/Sao_Paulo" },
	{ name: "America/Toronto", value: "America/Toronto" },
	{ name: "America/Vancouver", value: "America/Vancouver" },
	{ name: "America/Phoenix", value: "America/Phoenix" },
	{ name: "Europe/Amsterdam", value: "Europe/Amsterdam" },
	{ name: "Europe/Athens", value: "Europe/Athens" },
	{ name: "Europe/Berlin", value: "Europe/Berlin" },
	{ name: "Europe/Istanbul", value: "Europe/Istanbul" },
	{ name: "Europe/Lisbon", value: "Europe/Lisbon" },
	{ name: "Europe/London", value: "Europe/London" },
	{ name: "Europe/Madrid", value: "Europe/Madrid" },
	{ name: "Europe/Moscow", value: "Europe/Moscow" },
	{ name: "Europe/Paris", value: "Europe/Paris" },
	{ name: "Europe/Prague", value: "Europe/Prague" },
	{ name: "Europe/Rome", value: "Europe/Rome" },
	{ name: "Europe/Stockholm", value: "Europe/Stockholm" },
	{ name: "Africa/Cairo", value: "Africa/Cairo" },
	{ name: "Africa/Johannesburg", value: "Africa/Johannesburg" },
	{ name: "Africa/Lagos", value: "Africa/Lagos" },
	{ name: "Asia/Dubai", value: "Asia/Dubai" },
	{ name: "Asia/Jerusalem", value: "Asia/Jerusalem" },
	{ name: "Asia/Riyadh", value: "Asia/Riyadh" },
	{ name: "Asia/Tehran", value: "Asia/Tehran" },
	{ name: "Asia/Bangkok", value: "Asia/Bangkok" },
	{ name: "Asia/Hong_Kong", value: "Asia/Hong_Kong" },
	{ name: "Asia/Kolkata", value: "Asia/Kolkata" },
	{ name: "Asia/Seoul", value: "Asia/Seoul" },
	{ name: "Asia/Shanghai", value: "Asia/Shanghai" },
	{ name: "Asia/Singapore", value: "Asia/Singapore" },
	{ name: "Asia/Tokyo", value: "Asia/Tokyo" },
	{ name: "Asia/Taipei", value: "Asia/Taipei" },
	{ name: "Australia/Brisbane", value: "Australia/Brisbane" },
	{ name: "Australia/Melbourne", value: "Australia/Melbourne" },
	{ name: "Australia/Sydney", value: "Australia/Sydney" },
	{ name: "Pacific/Auckland", value: "Pacific/Auckland" },
	{ name: "Pacific/Honolulu", value: "Pacific/Honolulu" },
	{ name: "UTC", value: "UTC" },
];
