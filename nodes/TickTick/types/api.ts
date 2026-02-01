import type { IDataObject } from "n8n-workflow";

// ============================================================================
// Common Types
// ============================================================================

/** Resource locator value from n8n UI components */
export interface ResourceLocatorValue {
	mode: string;
	value: string;
}

/** User ID - represented as number in API responses */
export type UserId = number;

// ============================================================================
// Task Related Types
// ============================================================================

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

/** Task assignee information */
export interface TaskAssignee {
	userId: UserId;
	displayName?: string;
	username?: string;
}

/** Attachment on a task */
export interface TaskAttachment {
	id: string;
	name?: string;
	size?: number;
	path?: string;
	fileType?: string;
	createdTime?: string;
}

/** Focus session summary for a task */
export interface FocusSummary {
	pomoCount?: number;
	pomoDuration?: number;
	estimatedPomos?: number;
	focusDuration?: number;
}

/** Pomodoro session summary for a task */
export interface PomodoroSummary {
	pomoCount?: number;
	pomoDuration?: number;
	estimatedPomos?: number;
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
	assignee?: UserId | TaskAssignee;
	creator?: UserId;
	completedUserId?: UserId;
	commentCount?: number;
	attachments?: TaskAttachment[];
	focusSummaries?: FocusSummary[];
	pomodoroSummaries?: PomodoroSummary[];
}

// ============================================================================
// Project Related Types
// ============================================================================

/** Project closure information */
export interface ProjectClosure {
	closedTime?: string;
	closedBy?: UserId;
}

/** Project transfer information */
export interface ProjectTransfer {
	transferredTime?: string;
	fromUserId?: UserId;
	toUserId?: UserId;
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
	closed?: boolean | ProjectClosure;
	muted?: boolean;
	transferred?: boolean | ProjectTransfer;
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

// ============================================================================
// Batch & Sync Types
// ============================================================================

export interface BatchResponse extends IDataObject {
	id2etag: Record<string, string>;
	id2error: Record<string, string>;
}

/** Deleted item reference in sync response */
export interface DeletedItem {
	taskId: string;
	projectId?: string;
	deletedTime?: string;
}

export interface SyncTaskBean extends IDataObject {
	update: Task[];
	add?: Task[];
	delete?: DeletedItem[];
	empty?: boolean;
}

/** User-defined filter/smart list */
export interface UserFilter {
	id: string;
	name: string;
	etag?: string;
	rule?: string;
	sortOrder?: number;
	sortType?: string;
	viewMode?: string;
}

export interface SyncState extends IDataObject {
	inboxId: string;
	projectProfiles: Project[];
	projectGroups: ProjectGroup[];
	syncTaskBean: SyncTaskBean;
	tags: Tag[];
	filters?: UserFilter[];
	checkPoint: number;
}

export interface FocusHeatmap extends IDataObject {
	duration: number;
}

export type FocusDistribution = IDataObject & {
	[tagName: string]: number;
};

// ============================================================================
// Request Body Types
// ============================================================================

/** Base fields for creating/updating a task */
export interface TaskBody extends IDataObject {
	id?: string;
	projectId?: string;
	title?: string;
	content?: string;
	desc?: string;
	kind?: string;
	status?: number;
	priority?: number;
	startDate?: string | null;
	dueDate?: string | null;
	completedTime?: string | null;
	timeZone?: string;
	isAllDay?: boolean;
	repeatFlag?: string;
	reminders?: string[];
	items?: Partial<ChecklistItem>[];
	tags?: string[];
	sortOrder?: number;
}

/** Base fields for creating/updating a project */
export interface ProjectBody extends IDataObject {
	id?: string;
	name?: string;
	color?: string;
	kind?: string;
	groupId?: string;
	viewMode?: string;
	sortOrder?: number;
}

/** Batch request for tasks */
export interface TaskBatchRequest {
	add?: TaskBody[];
	update?: TaskBody[];
	delete?: Array<{ taskId: string; projectId: string }>;
}

/** Batch request for projects */
export interface ProjectBatchRequest {
	add?: ProjectBody[];
	update?: ProjectBody[];
	delete?: Array<{ projectId: string }>;
}

/** Task assignment request body */
export interface TaskAssignRequest {
	assignee: string;
	projectId: string;
	taskId: string;
}

/** Project user in shared project */
export interface ProjectUser {
	userId: UserId;
	displayName?: string;
	username?: string;
	permission?: string;
}
