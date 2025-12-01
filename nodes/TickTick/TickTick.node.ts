import {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from "n8n-workflow";

import {
	formatTickTickDate,
	getInboxProjectId,
	getProjects,
	getTasks,
	tickTickApiRequest,
} from "./GenericFunctions";

import {
	projectFields,
	projectOperations,
	taskFields,
	taskOperations,
} from "./descriptions";

export class TickTick implements INodeType {
	methods = {
		loadOptions: {
			async getProjects(
				this: ILoadOptionsFunctions,
			): Promise<{ name: string; value: string }[]> {
				return await getProjects.call(this);
			},
			async getTasks(
				this: ILoadOptionsFunctions,
			): Promise<{ name: string; value: string }[]> {
				const projectId = this.getCurrentNodeParameter("projectId") as string;
				return await getTasks.call(this, projectId);
			},
		},
	};

	description: INodeTypeDescription = {
		displayName: "TickTick",
		name: "tickTick",
		icon: "file:ticktick.svg",
		group: ["transform"],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		version: 1,
		description: "TickTick is a powerful task management application",
		defaults: {
			name: "TickTick",
		},
		inputs: ["main"],
		outputs: ["main"],
		credentials: [
			{
				name: "tickTickTokenApi",
				required: true,
				displayOptions: {
					show: {
						authentication: ["tickTickTokenApi"],
					},
				},
			},
			{
				name: "tickTickOAuth2Api",
				required: true,
				displayOptions: {
					show: {
						authentication: ["tickTickOAuth2Api"],
					},
				},
			},
		],
		properties: [
			{
				displayName: "Authentication",
				name: "authentication",
				type: "options",
				options: [
					{
						name: "Access Token",
						value: "tickTickTokenApi",
					},
					{
						name: "OAuth2",
						value: "tickTickOAuth2Api",
					},
				],
				default: "tickTickTokenApi",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "Task",
						value: "task",
					},
					{
						name: "Project",
						value: "project",
					},
				],
				default: "task",
			},
			...taskOperations,
			...taskFields,
			...projectOperations,
			...projectFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter("resource", i) as string;
			const operation = this.getNodeParameter("operation", i) as string;

			if (resource === "project") {
				//**************************************
				//		PROJECT RESOURCE
				//**************************************
				switch (operation) {
					//---------------------------------
					//	CREATE PROJECT
					//---------------------------------
					case "create": {
						const useJsonParameters = this.getNodeParameter(
							"jsonParameters",
							i,
						) as boolean;
						let body: IDataObject = {};

						if (useJsonParameters) {
							const jsonInput = this.getNodeParameter(
								"additionalFieldsJson",
								i,
								"",
							) as string;
							try {
								if (jsonInput) {
									body = JSON.parse(jsonInput);
								} else {
									throw new NodeOperationError(
										this.getNode(),
										"JSON input is empty.",
									);
								}
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON input: ${error.message}`,
								);
							}
						} else {
							const additionalFields = this.getNodeParameter(
								"additionalFields",
								i,
							) as IDataObject;
							body = {
								name: this.getNodeParameter("name", i) as string,
								viewMode: (additionalFields.viewMode as string) || "list",
								kind: (additionalFields.kind as string) || "task",
								color: (additionalFields.color as string) || undefined,
							};
							Object.keys(body).forEach((key) =>
								body[key] === undefined && delete body[key]
							);
						}

						const endpoint = "/open/v1/project";
						responseData = await tickTickApiRequest.call(
							this,
							"POST",
							endpoint,
							body,
						);
						break;
					}
					//---------------------------------
					//	GET PROJECT
					//---------------------------------
					case "get": {
						const projectId = this.getNodeParameter("projectId", i) as
							| string
							| undefined;
						const projectData = this.getNodeParameter(
							"projectData",
							i,
							false,
						) as boolean;

						let endpoint: string;

						if (projectId === "inbox") {
							endpoint = "/open/v1/project/inbox/data";
						} else {
							endpoint = "/open/v1/project";

							if (projectId) {
								endpoint += `/${projectId}`;
								if (projectData) {
									endpoint += "/data";
								}
							}
						}

						responseData = await tickTickApiRequest.call(this, "GET", endpoint);
						break;
					}
					//---------------------------------
					//	UPDATE PROJECT
					//---------------------------------
					case "update": {
						let projectId = this.getNodeParameter("projectId", i, "") as string; // Set default as empty string
						const useJsonParameters = this.getNodeParameter(
							"jsonParameters",
							i,
						) as boolean;
						let body: IDataObject = {};

						if (useJsonParameters) {
							const jsonInput = this.getNodeParameter(
								"additionalFieldsJson",
								i,
								"",
							) as string;
							try {
								if (jsonInput) {
									body = JSON.parse(jsonInput);
									projectId = body.projectId
										? (body.projectId as string)
										: projectId;
									if (!projectId) {
										throw new NodeOperationError(
											this.getNode(),
											"Project ID must be provided within the JSON input",
										);
									}
									delete body.projectId;
								} else {
									throw new NodeOperationError(
										this.getNode(),
										"JSON input is empty.",
									);
								}
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Invalid JSON input: ${error.message}`,
								);
							}
						} else {
							const additionalFields = this.getNodeParameter(
								"additionalFields",
								i,
							) as IDataObject;
							body = {
								name: (additionalFields.name as string) || undefined,
								viewMode: (additionalFields.viewMode as string) || "list",
								kind: (additionalFields.kind as string) || "task",
								color: (additionalFields.color as string) || undefined,
							};
							Object.keys(body).forEach((key) =>
								body[key] === undefined && delete body[key]
							);
						}

						if (!projectId) {
							throw new NodeOperationError(
								this.getNode(),
								"Project ID is required",
							);
						}

						const endpoint = `/open/v1/project/${projectId}`;
						responseData = await tickTickApiRequest.call(
							this,
							"POST",
							endpoint,
							body,
						);
						break;
					}
					//---------------------------------
					//	DELETE PROJECT
					//---------------------------------
					case "delete": {
						const projectId = this.getNodeParameter("projectId", i) as string;
						const endpoint = `/open/v1/project/${projectId}`;
						responseData = await tickTickApiRequest.call(
							this,
							"DELETE",
							endpoint,
						);

						if (!responseData || Object.keys(responseData).length === 0) {
							responseData = {
								success: true,
								message: `Project "${projectId}" was successfully deleted.`,
								projectId,
							};
						}

						break;
					}
					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not known!`,
						);
				}
			} else if (resource === "task") {
				//**************************************
				//		TASK RESOURCE
				//**************************************
				switch (operation) {
					//---------------------------------
					//	CREATE TASK
					//---------------------------------
					case "create": {
						const useJsonParameters = this.getNodeParameter(
							"jsonParameters",
							i,
						) as boolean;

						let body: IDataObject;
						if (useJsonParameters) {
							const jsonInput = this.getNodeParameter(
								"additionalFieldsJson",
								i,
								"",
							) as string;
							try {
								body = JSON.parse(jsonInput);
							} catch (error) {
								const errorMessage = error instanceof Error
									? `Invalid JSON: ${error.message}`
									: "An unexpected error occurred.";
								throw new NodeOperationError(this.getNode(), errorMessage);
							}
						} else {
							const additionalFields = this.getNodeParameter(
								"additionalFields",
								i,
							) as IDataObject;

							body = {
								title: this.getNodeParameter("title", i) as string,
								projectId: this.getNodeParameter("projectId", i) as string,
								content: (additionalFields.content as string) || undefined,
								desc: (additionalFields.desc as string) || undefined,
								isAllDay: (additionalFields.isAllDay as boolean) || false,
								startDate: formatTickTickDate(
									additionalFields.startDate as string,
								),
								dueDate: formatTickTickDate(additionalFields.dueDate as string),
								timeZone: (additionalFields.timeZone as string) || undefined,
								priority: (additionalFields.priority as number) || 0,
							};
						}

						Object.keys(body).forEach((key) => {
							if (body[key] === undefined || body[key] === "") {
								delete body[key];
							}
						});

						const endpoint = "/open/v1/task";
						responseData = await tickTickApiRequest.call(
							this,
							"POST",
							endpoint,
							body,
						);
						break;
					}
					//---------------------------------
					//	GET TASK
					//---------------------------------
					case "get": {
						const projectIdParam = this.getNodeParameter(
							"projectId",
							i,
						) as string;
						const taskId = this.getNodeParameter("taskId", i) as string;

						const projectId = projectIdParam || "inbox";

						const endpoint = `/open/v1/project/${projectId}/task/${taskId}`;
						responseData = await tickTickApiRequest.call(this, "GET", endpoint);
						break;
					}
					//---------------------------------
					//	UPDATE TASK
					//---------------------------------
					case "update": {
						const useJsonParameters = this.getNodeParameter(
							"jsonParameters",
							i,
						) as boolean;

						let body: IDataObject;

						if (useJsonParameters) {
							const jsonInput = this.getNodeParameter(
								"additionalFieldsJson",
								i,
								"",
							) as string;

							try {
								body = JSON.parse(jsonInput);
							} catch (error) {
								const errorMessage = error instanceof Error
									? `Invalid JSON: ${error.message}`
									: "An unexpected error occurred during JSON parsing.";
								throw new NodeOperationError(this.getNode(), errorMessage);
							}
						} else {
							const additionalFields = this.getNodeParameter(
								"additionalFields",
								i,
							) as IDataObject;

							const projectIdParam = this.getNodeParameter(
								"projectId",
								i,
							) as string;

							let projectId: string | undefined = projectIdParam;

							if (!projectIdParam) {
								projectId = await getInboxProjectId.call(this);
							}

							body = {
								projectId,
								title: this.getNodeParameter("title", i) as string,
								content: (additionalFields.content as string) || undefined,
								desc: (additionalFields.desc as string) || undefined,
								isAllDay: (additionalFields.isAllDay as boolean) || false,
								startDate: formatTickTickDate(
									additionalFields.startDate as string,
								),
								dueDate: formatTickTickDate(
									additionalFields.dueDate as string,
								),
								timeZone: (additionalFields.timeZone as string) || undefined,
								priority: (additionalFields.priority as number) || 0,
							};
						}

						Object.keys(body).forEach((key) => {
							if (body[key] === undefined || body[key] === "") {
								delete body[key];
							}
						});

						const taskId = this.getNodeParameter("taskId", i) as string;
						const endpoint = `/open/v1/task/${taskId}`;

						responseData = await tickTickApiRequest.call(
							this,
							"POST",
							endpoint,
							body,
						);

						break;
					}
					//---------------------------------
					//	COMPLETE TASK
					//---------------------------------
					case "complete": {
						const projectIdParam = this.getNodeParameter(
							"projectId",
							i,
						) as string;
						const taskId = this.getNodeParameter("taskId", i) as string;

						const projectId = projectIdParam || "inbox";

						const endpoint =
							`/open/v1/project/${projectId}/task/${taskId}/complete`;

						responseData = await tickTickApiRequest.call(
							this,
							"POST",
							endpoint,
							{},
						);

						await tickTickApiRequest.call(this, "POST", endpoint);

						responseData = {
							success: true,
							operation: "complete",
							taskId,
							projectId,
						};

						break;
					}
					//---------------------------------
					//	DELETE TASK
					//---------------------------------
					case "delete": {
						const projectIdParam = this.getNodeParameter(
							"projectId",
							i,
						) as string;
						const taskId = this.getNodeParameter("taskId", i) as string;

						let projectId: string;

						if (!projectIdParam) {
							projectId = await getInboxProjectId.call(this);
						} else {
							projectId = projectIdParam;
						}

						const endpoint = `/open/v1/project/${projectId}/task/${taskId}`;
						responseData = await tickTickApiRequest.call(
							this,
							"DELETE",
							endpoint,
						);

						await tickTickApiRequest.call(this, "DELETE", endpoint);

						responseData = {
							success: true,
							operation: "delete",
							taskId,
							projectId,
						};

						break;
					}
				}
			} else {
				throw new NodeOperationError(
					this.getNode(),
					`The resource "${resource}" is not known!`,
				);
			}
		}

		return [this.helpers.returnJsonArray(responseData)];
	}
}
