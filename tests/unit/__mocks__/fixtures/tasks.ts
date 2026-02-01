export const sampleTask = {
	id: "task123",
	projectId: "project456",
	title: "Sample Task",
	content: "Task description",
	status: 0,
	priority: 0,
	tags: [],
	items: [],
	sortOrder: 0,
};

export const sampleTaskWithTags = {
	...sampleTask,
	tags: ["work", "important"],
};

export const sampleTaskWithSubtasks = {
	...sampleTask,
	items: [
		{ id: "sub1", title: "Subtask 1", status: 0, sortOrder: 0 },
		{ id: "sub2", title: "Subtask 2", status: 1, sortOrder: 1 },
	],
};

export const sampleTaskCompleted = {
	...sampleTask,
	status: 2,
	completedTime: "2024-01-15T10:30:00.000+0000",
};

export const sampleTaskWithDates = {
	...sampleTask,
	startDate: "2024-01-15T09:00:00.000+0000",
	dueDate: "2024-01-20T17:00:00.000+0000",
	isAllDay: false,
	timeZone: "America/New_York",
};

export const sampleTaskWithReminders = {
	...sampleTask,
	reminders: ["TRIGGER:PT0S", "TRIGGER:P0DT9H0M0S"],
};

export const sampleTaskWithRepeat = {
	...sampleTask,
	repeatFlag: "RRULE:FREQ=DAILY;INTERVAL=1",
};

export const sampleTaskMinimal = {
	id: "taskMinimal",
	projectId: "inbox",
	title: "Minimal Task",
	status: 0,
};

export const sampleTaskFull = {
	id: "taskFull",
	projectId: "project456",
	title: "Full Task",
	content: "Full description with all fields",
	desc: "Checklist description",
	status: 0,
	priority: 5,
	tags: ["work", "urgent", "important"],
	items: [
		{
			id: "sub1",
			title: "Subtask 1",
			status: 0,
			sortOrder: 0,
			isAllDay: false,
		},
		{
			id: "sub2",
			title: "Subtask 2",
			status: 1,
			sortOrder: 1,
			completedTime: "2024-01-14T10:00:00.000+0000",
		},
	],
	startDate: "2024-01-15T09:00:00.000+0000",
	dueDate: "2024-01-20T17:00:00.000+0000",
	completedTime: null,
	isAllDay: false,
	timeZone: "America/New_York",
	reminders: ["TRIGGER:PT0S"],
	repeatFlag: "RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO",
	sortOrder: 100,
};
