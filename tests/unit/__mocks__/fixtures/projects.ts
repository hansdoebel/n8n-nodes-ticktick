export const sampleProject = {
	id: "project456",
	name: "Test Project",
	color: "#3b82f6",
	sortOrder: 0,
	viewMode: "list",
	kind: "TASK",
};

export const sampleProjectWithGroup = {
	...sampleProject,
	groupId: "group123",
};

export const sampleInbox = {
	id: "inbox",
	name: "Inbox",
	color: null,
	sortOrder: 0,
	viewMode: "list",
	kind: "TASK",
};

export const sampleSharedProject = {
	...sampleProject,
	id: "sharedProject",
	name: "Shared Project",
	userCount: 3,
	members: [
		{ userId: "user123", name: "Owner", role: "owner" },
		{ userId: "user456", name: "Member 1", role: "member" },
		{ userId: "user789", name: "Member 2", role: "member" },
	],
};

export const sampleClosedProject = {
	...sampleProject,
	id: "closedProject",
	name: "Closed Project",
	closed: true,
};

export const sampleProjectMinimal = {
	id: "projectMinimal",
	name: "Minimal Project",
};

export const sampleProjectFull = {
	id: "projectFull",
	name: "Full Project",
	color: "#ff5733",
	sortOrder: 100,
	viewMode: "kanban",
	kind: "TASK",
	groupId: "group123",
	permission: "write",
	teamId: null,
	isOwner: true,
	userCount: 1,
};
