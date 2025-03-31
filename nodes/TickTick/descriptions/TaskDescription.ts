import type { INodeProperties } from 'n8n-workflow';
import { TimeZones } from '../GenericFunctions';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Complete',
				value: 'complete',
				description: 'Complete a Task',
				action: 'Complete a task',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a Task',
				action: 'Create a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a Task',
				action: 'Delete a task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a Task',
				action: 'Get a task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a Task',
				action: 'Update a task',
			},
		],
		default: 'create',
	},
];

export const taskFields: INodeProperties[] = [
	//**************************************
	//		COMPLETE TASK OPERATION
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
				resource: ['task'],
				operation: ['complete'],
			},
		},
	},
	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTasks',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['complete'],
			},
		},
	},
	//**************************************
	//		CREATE TASK OPERATION
	//**************************************
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
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
				resource: ['task'],
				operation: ['create'],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Task Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
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
				resource: ['task'],
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
				resource: ['task'],
				operation: ['create'],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: 'Task Content',
				name: 'content',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description of Checklist',
				name: 'desc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'All Day',
				name: 'isAllDay',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Time Zone',
				name: 'timeZone',
				type: 'options',
				options: TimeZones,
				default: '',
				description: 'Choose from the list, or specify a Time Zone using an expression',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an expression',
				options: [
					{
						name: 'High',
						value: 5,
					},
					{
						name: 'Medium',
						value: 3,
					},
					{
						name: 'Low',
						value: 1,
					},
					{
						name: 'None',
						value: 0,
					},
				],
				default: 0,
			},
		],
	},
	//**************************************
	//		GET TASK OPERATION
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
				resource: ['task'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTasks',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get'],
			},
		},
	},
	//**************************************
	//		UPDATE TASK OPERATION
	//**************************************
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['task'],
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
				resource: ['task'],
				operation: ['update'],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		required: true,
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTasks',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
				jsonParameters: [false],
			},
		},
	},
	{
		displayName: 'Task Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
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
				resource: ['task'],
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
				resource: ['task'],
				operation: ['update'],
				jsonParameters: [false],
			},
		},
		options: [
			{
				displayName: 'Task Content',
				name: 'content',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description of Checklist',
				name: 'desc',
				type: 'string',
				default: '',
			},
			{
				displayName: 'All Day',
				name: 'isAllDay',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Time Zone',
				name: 'timeZone',
				type: 'options',
				options: TimeZones,
				default: '',
				description: 'Choose from the list, or specify a Time Zone using an expression',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an expression',
				options: [
					{
						name: 'High',
						value: 5,
					},
					{
						name: 'Medium',
						value: 3,
					},
					{
						name: 'Low',
						value: 1,
					},
					{
						name: 'None',
						value: 0,
					},
				],
				default: 0,
			},
		],
	},
	//**************************************
	//		DELETE TASK OPERATION
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
				resource: ['task'],
				operation: ['delete'],
			},
		},
	},
	{
		displayName: 'Task Name or ID',
		name: 'taskId',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTasks',
			loadOptionsDependsOn: ['projectId'],
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['delete'],
			},
		},
	},
];
