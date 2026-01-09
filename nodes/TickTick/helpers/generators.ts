export function generateId(length: number = 24): string {
	return Array.from(
		{ length },
		() => Math.floor(Math.random() * 16).toString(16),
	).join("");
}

export function generateHabitId(): string {
	return generateId(24);
}

export function generateCheckinId(): string {
	return generateId(24);
}

export function generateTaskId(): string {
	return generateId(24);
}

export function generateProjectId(): string {
	return generateId(24);
}
