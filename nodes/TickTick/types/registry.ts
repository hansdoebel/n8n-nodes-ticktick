import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeProperties,
} from "n8n-workflow";

export type OperationHandler = (
	this: IExecuteFunctions,
	index: number,
) => Promise<INodeExecutionData[]>;

export type LoadOptionsFunction = (
	this: ILoadOptionsFunctions,
) => Promise<any>;

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
