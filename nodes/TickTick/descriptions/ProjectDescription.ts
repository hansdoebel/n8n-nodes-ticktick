import type { INodeProperties } from 'n8n-workflow';

export const projectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a Project',
				action: 'Create a project',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a Project',
				action: 'Get a project',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a Project',
				action: 'Update a project',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a Project',
				action: 'Delete a project',
			},
		],
		default: 'create',
	},
];

export const projectFields: INodeProperties[] = [
	//**************************************
	//		CREATE PROJECT OPERATION
	//**************************************
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Project Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFieldsJson',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
				jsonParameters: [true],
			},
		},
		description:
			'Object of values to set as described <a href="https://developer.ticktick.com/">here</a>',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: 'View Mode',
				name: 'viewMode',
				type: 'options',
				options: [
					{
						name: 'List',
						value: 'list',
					},
					{
						name: 'Kanban',
						value: 'kanban',
					},
					{
						name: 'Timeline',
						value: 'timeline',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Kind',
				name: 'kind',
				type: 'options',
				options: [
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Note',
						value: 'note',
					},
				],
				default: 'task',
			},
			{
				displayName: 'Color',
				name: 'color',
				description: 'Color of project, eg. "#F18181".',
				type: 'color',
				default: '',
			},
		],
	},
	//**************************************
	//		GET PROJECT OPERATION
	//**************************************
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Get Project with Data',
		name: 'projectData',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['get'],
			},
		},
	},
	//**************************************
	//		UPDATE PROJECT OPERATION
	//**************************************
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['update'],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFieldsJson',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['update'],
				jsonParameters: [true],
			},
		},
		description:
			'Object of values to set as described <a href="https://developer.ticktick.com/">here</a>',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['update'],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: 'Project Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'View Mode',
				name: 'viewMode',
				type: 'options',
				options: [
					{
						name: 'List',
						value: 'list',
					},
					{
						name: 'Kanban',
						value: 'kanban',
					},
					{
						name: 'Timeline',
						value: 'timeline',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Kind',
				name: 'kind',
				type: 'options',
				options: [
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Note',
						value: 'note',
					},
				],
				default: 'task',
			},
			{
				displayName: 'Color',
				name: 'color',
				description: 'Color of project, eg. "#F18181".',
				type: 'color',
				default: '',
			},
		],
	},
	//**************************************
	//		DELETE PROJECT OPERATION
	//**************************************
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProjects',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['delete'],
			},
		},
	},
];
