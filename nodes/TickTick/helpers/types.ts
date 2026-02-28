import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeProperties,
} from "n8n-workflow";

export interface ResourceLocatorValue {
	mode: string;
	value: string;
}

export type UserId = number;

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

export interface TaskAssignee {
	userId: UserId;
	displayName?: string;
	username?: string;
}

export interface TaskAttachment {
	id: string;
	name?: string;
	size?: number;
	path?: string;
	fileType?: string;
	createdTime?: string;
}

export interface FocusSummary {
	pomoCount?: number;
	pomoDuration?: number;
	estimatedPomos?: number;
	focusDuration?: number;
}

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

export interface ProjectClosure {
	closedTime?: string;
	closedBy?: UserId;
}

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

export interface BatchResponse extends IDataObject {
	id2etag: Record<string, string>;
	id2error: Record<string, string>;
}

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

export interface ProjectBody extends IDataObject {
	id?: string;
	name?: string;
	color?: string;
	kind?: string;
	groupId?: string;
	viewMode?: string;
	sortOrder?: number;
}

export interface TaskBatchRequest {
	add?: TaskBody[];
	update?: TaskBody[];
	delete?: Array<{ taskId: string; projectId: string }>;
}

export interface ProjectBatchRequest {
	add?: ProjectBody[];
	update?: ProjectBody[];
	delete?: Array<{ projectId: string }>;
}

export interface TaskAssignRequest {
	assignee: string;
	projectId: string;
	taskId: string;
}

export interface ProjectUser {
	userId: UserId;
	displayName?: string;
	username?: string;
	permission?: string;
}

export type OperationHandler = (
	this: IExecuteFunctions,
	index: number,
) => Promise<INodeExecutionData[]>;

export type LoadOptionsFunction = (
	this: ILoadOptionsFunctions,
) => Promise<{ name: string; value: string }[]>;

export type ListSearchFunction = (
	this: ILoadOptionsFunctions,
	filter?: string,
) => Promise<INodeListSearchResult>;

export interface ResourceMethods {
	loadOptions?: Record<string, LoadOptionsFunction>;
	listSearch?: Record<string, ListSearchFunction>;
}

export interface ResourceDefinition {
	name: string;
	operations: INodeProperties[];
	fields: INodeProperties[];
	handlers: Record<string, OperationHandler>;
	methods?: ResourceMethods;
}

export class ResourceRegistry {
	private resources = new Map<string, ResourceDefinition>();

	register(resource: ResourceDefinition): void {
		this.resources.set(resource.name, resource);
	}

	getHandler(
		resource: string,
		operation: string,
	): OperationHandler | undefined {
		const resourceDef = this.resources.get(resource);
		return resourceDef?.handlers[operation];
	}

	getAllOperations(): INodeProperties[] {
		return Array.from(this.resources.values()).flatMap((r) => r.operations);
	}

	getAllFields(): INodeProperties[] {
		return Array.from(this.resources.values()).flatMap((r) => r.fields);
	}

	getAllProperties(): INodeProperties[] {
		const properties: INodeProperties[] = [];
		for (const resource of this.resources.values()) {
			properties.push(...resource.operations);
			properties.push(...resource.fields);
		}
		return properties;
	}

	getAllLoadOptions(): Record<string, LoadOptionsFunction> {
		const allOptions: Record<string, LoadOptionsFunction> = {};
		for (const resource of this.resources.values()) {
			if (resource.methods?.loadOptions) {
				Object.assign(allOptions, resource.methods.loadOptions);
			}
		}
		return allOptions;
	}

	getAllListSearch(): Record<string, ListSearchFunction> {
		const allSearch: Record<string, ListSearchFunction> = {};
		for (const resource of this.resources.values()) {
			if (resource.methods?.listSearch) {
				Object.assign(allSearch, resource.methods.listSearch);
			}
		}
		return allSearch;
	}

	getResourceNames(): string[] {
		return Array.from(this.resources.keys());
	}
}
