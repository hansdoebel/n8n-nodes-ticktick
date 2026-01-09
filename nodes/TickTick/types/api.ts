import type { IDataObject } from "n8n-workflow";

export interface TaskReminder {
	id?: string;
	trigger: string;
}

export interface ChecklistItem {
	id: string;
	title?: string;
	status?: number;
	completedTime?: string;
	startDate?: string;
	timeZone?: string;
	isAllDay?: boolean;
	sortOrder?: number;
}

export interface Task extends IDataObject {
	id: string;
	projectId: string;
	etag?: string;
	title?: string;
	content?: string;
	desc?: string;
	kind?: string;
	status?: number;
	priority?: number;
	progress?: number;
	deleted?: number;
	startDate?: string;
	dueDate?: string;
	createdTime?: string;
	modifiedTime?: string;
	completedTime?: string;
	timeZone?: string;
	isAllDay?: boolean;
	isFloating?: boolean;
	repeatFlag?: string;
	repeatFrom?: number;
	repeatFirstDate?: string;
	repeatTaskId?: string;
	exDate?: string[];
	reminder?: string;
	reminders?: TaskReminder[];
	remindTime?: string;
	parentId?: string;
	childIds?: string[];
	items?: ChecklistItem[];
	tags?: string[];
	columnId?: string;
	sortOrder?: number;
	assignee?: any;
	creator?: number;
	completedUserId?: number;
	commentCount?: number;
	attachments?: any[];
	focusSummaries?: any[];
	pomodoroSummaries?: any[];
}

export interface Project extends IDataObject {
	id: string;
	etag?: string;
	name: string;
	color?: string;
	kind?: string;
	groupId?: string;
	inAll?: boolean;
	viewMode?: string;
	sortOrder?: number;
	sortType?: string;
	modifiedTime?: string;
	isOwner?: boolean;
	userCount?: number;
	closed?: any;
	muted?: boolean;
	transferred?: any;
}

export interface ProjectGroup extends IDataObject {
	id: string;
	etag?: string;
	name: string;
	viewMode?: string;
	sortOrder?: number;
	sortType?: string;
	deleted?: number;
	showAll?: boolean;
}

export interface Tag extends IDataObject {
	name: string;
	label: string;
	rawName?: string;
	etag?: string;
	color?: string;
	parent?: string;
	sortType?: string;
	sortOrder?: number;
}

export interface Habit extends IDataObject {
	id: string;
	etag?: string;
	name: string;
	iconRes?: string;
	color?: string;
	sortOrder?: number;
	status?: number;
	encouragement?: string;
	totalCheckIns?: number;
	currentStreak?: number;
	createdTime?: string;
	modifiedTime?: string;
	archivedTime?: string;
	type?: "Boolean" | "Real";
	goal?: number;
	step?: number;
	unit?: string;
	recordEnable?: boolean;
	repeatRule?: string;
	reminders?: string[];
	sectionId?: string;
	targetDays?: number;
	targetStartDate?: number;
	completedCycles?: number;
	exDates?: string[];
	style?: number;
}

export interface HabitCheckin extends IDataObject {
	id: string;
	habitId: string;
	checkinStamp: number;
	checkinTime: string;
	opTime: string;
	value: number;
	goal: number;
	status: number;
}

export interface UserProfile extends IDataObject {
	username: string;
	displayName?: string;
	name?: string;
	picture?: string;
	locale?: string;
	userCode?: string;
	verifiedEmail?: boolean;
	email?: string;
}

export interface UserStatus extends IDataObject {
	userId: string;
	userCode?: string;
	username: string;
	teamPro?: boolean;
	proStartDate?: string;
	proEndDate?: string;
	subscribeType?: string;
	needSubscribe?: boolean;
	inboxId: string;
	teamUser?: boolean;
	pro?: boolean;
	freeTrial?: boolean;
}

export interface UserPreferences extends IDataObject {
	id: string;
	timeZone?: string;
}

export interface BatchResponse extends IDataObject {
	id2etag: Record<string, string>;
	id2error: Record<string, string>;
}

export interface SyncTaskBean extends IDataObject {
	update: Task[];
	add?: Task[];
	delete?: any[];
	empty?: boolean;
}

export interface SyncState extends IDataObject {
	inboxId: string;
	projectProfiles: Project[];
	projectGroups: ProjectGroup[];
	syncTaskBean: SyncTaskBean;
	tags: Tag[];
	filters?: any[];
	checkPoint: number;
}

export interface FocusHeatmap extends IDataObject {
	duration: number;
}

export type FocusDistribution = IDataObject & {
	[tagName: string]: number;
};
