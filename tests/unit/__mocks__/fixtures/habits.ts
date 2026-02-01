export const sampleHabit = {
	id: "habit123",
	name: "Exercise",
	color: "#97E38B",
	goal: 1,
	status: 0,
	iconRes: "habit_exercise",
	sortOrder: 0,
};

export const sampleHabitArchived = {
	...sampleHabit,
	id: "habitArchived",
	name: "Archived Habit",
	status: 1,
};

export const sampleHabitWithReminders = {
	...sampleHabit,
	reminders: ["09:00", "21:00"],
};

export const sampleHabitMinimal = {
	id: "habitMinimal",
	name: "Minimal Habit",
};

export const sampleHabitFull = {
	id: "habitFull",
	name: "Full Habit",
	color: "#6495ED",
	goal: 3,
	status: 0,
	iconRes: "habit_custom",
	icon: "custom_icon_url",
	sortOrder: 100,
	reminders: ["08:00", "12:00", "20:00"],
	repeatRule: "RRULE:FREQ=DAILY;INTERVAL=1",
	encouragement: "Keep going!",
	totalCheckIns: 50,
	sectionId: "section1",
};

export const sampleCheckin = {
	id: "checkin123",
	habitId: "habit123",
	status: 2,
	value: 1,
	stamp: 20240115,
	checkinTime: "2024-01-15T10:30:00.000+0000",
};
