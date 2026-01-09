import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";

export type OperationHandler = (
	this: IExecuteFunctions,
	index: number,
) => Promise<INodeExecutionData[]>;

export interface ResourceOperation {
	operation: string;
	handler: OperationHandler;
}

export interface ResourceDefinition {
	name: string;
	operations: INodeProperties[];
	fields: INodeProperties[];
	handlers: Record<string, OperationHandler>;
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

	getResourceNames(): string[] {
		return Array.from(this.resources.keys());
	}
}
