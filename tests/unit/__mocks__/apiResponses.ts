export const mockSyncResponse = {
	syncTaskBean: {
		update: [
			{
				id: "task123",
				projectId: "project456",
				title: "Test Task",
				content: "Task description",
				status: 0,
				priority: 0,
				tags: ["work", "urgent"],
				items: [],
			},
			{
				id: "task456",
				projectId: "project456",
				title: "Another Task",
				content: "",
				status: 0,
				priority: 1,
				tags: [],
				items: [],
			},
		],
		add: [],
	},
	projectProfiles: [
		{
			id: "project456",
			name: "Test Project",
			color: "#3b82f6",
			sortOrder: 0,
			viewMode: "list",
		},
		{
			id: "inbox",
			name: "Inbox",
			color: null,
			sortOrder: 0,
			viewMode: "list",
		},
	],
	tags: [
		{ name: "work", label: "Work", color: "#ff0000" },
		{ name: "urgent", label: "Urgent", color: "#ff9900" },
		{ name: "personal", label: "Personal", color: "#00ff00" },
	],
	habits: [],
	projectGroups: [],
};

export const mockTaskBatchResponse = {
	id2etag: { task123: "etag-abc" },
	id2error: {},
};

export const mockProjectBatchResponse = {
	id2etag: { project456: "etag-def" },
	id2error: {},
};

export const mockHabitsResponse = [
	{
		id: "habit123",
		name: "Exercise",
		color: "#97E38B",
		goal: 1,
		status: 0,
		iconRes: "habit_exercise",
		sortOrder: 0,
	},
	{
		id: "habit456",
		name: "Read",
		color: "#6495ED",
		goal: 1,
		status: 0,
		iconRes: "habit_read",
		sortOrder: 1,
	},
];

export const mockTagsResponse = {
	tags: [
		{ name: "work", label: "Work", color: "#F18181", sortOrder: 0 },
		{ name: "personal", label: "Personal", color: "#4A90D9", sortOrder: 1 },
	],
};

export const mockProjectGroupsResponse = [
	{ id: "group123", name: "Work Projects", sortOrder: 0 },
	{ id: "group456", name: "Personal Projects", sortOrder: 1 },
];

export const mockUserProfileResponse = {
	id: "user123",
	username: "testuser",
	email: "test@example.com",
	name: "Test User",
};

export const mockUserStatusResponse = {
	userId: "user123",
	isPro: false,
	proEndDate: null,
};

export const mockUserPreferencesResponse = {
	timeZone: "America/New_York",
	weekStart: 0,
	dateFormat: "MM/dd/yyyy",
	timeFormat: "12",
};

export const mockCompletedTasksResponse = [
	{
		id: "completed1",
		projectId: "project456",
		title: "Completed Task",
		status: 2,
		completedTime: "2024-01-15T10:30:00.000+0000",
	},
];

export const mockDeletedTasksResponse = {
	tasks: [
		{
			id: "deleted1",
			projectId: "project456",
			title: "Deleted Task",
			status: -1,
		},
	],
};

export const mockFocusHeatmapResponse = [
	{ date: "20240115", duration: 3600 },
	{ date: "20240116", duration: 7200 },
];

export const mockFocusDistributionResponse = {
	total: 36000,
	distribution: [
		{ projectId: "project456", duration: 18000 },
		{ projectId: "inbox", duration: 18000 },
	],
};
