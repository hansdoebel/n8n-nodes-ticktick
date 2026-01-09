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
