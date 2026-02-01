export const sampleTag = {
	name: "work",
	label: "Work",
	color: "#ff0000",
	sortOrder: 0,
};

export const sampleTagWithParent = {
	name: "subtag",
	label: "SubTag",
	color: "#00ff00",
	sortOrder: 1,
	parent: "work",
};

export const sampleTagMinimal = {
	name: "minimal",
	label: "Minimal",
};

export const sampleTagFull = {
	name: "fulltag",
	label: "Full Tag",
	color: "#3b82f6",
	sortOrder: 100,
	parent: null,
	sortType: "title",
};

export const sampleTags = [
	{ name: "work", label: "Work", color: "#ff0000", sortOrder: 0 },
	{ name: "personal", label: "Personal", color: "#00ff00", sortOrder: 1 },
	{ name: "urgent", label: "Urgent", color: "#ff9900", sortOrder: 2 },
	{ name: "important", label: "Important", color: "#9900ff", sortOrder: 3 },
];
