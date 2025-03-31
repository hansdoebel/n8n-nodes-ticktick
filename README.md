# n8n-nodes-ticktick

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This is an n8n community node. It lets you use TickTick in your n8n workflows.

TickTick is a comprehensive productivity app designed to help individuals and teams manage tasks, deadlines, and projects more efficiently. With its intuitive interface, TickTick allows users to easily create, organize, and prioritize tasks, set reminders, and track progress through various views such as lists, kanban boards, and calendars.

[Installation](#installation)  
[Task Operations](#task-operations)  
[Project Operations](#projectoperations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Known Issues](#known-issues)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes.**
2. Select **Install.**
3. Find the node you want to install:

   a.) Select **Browse**. n8n takes you to an npm search results page, showing all npm packages tagged with the keyword `n8n-community-node-package`.

   b.) Browse the list of results. You can filter the results or add more keywords.

   c.) Once you find the package you want, make a note of the package name. If you want to install a specific version, make a note of the version number as well.

   d.) Return to n8n.

4. Enter the npm package name, and version number if required.
5. Agree to the risks of using community nodes: select I understand the risks of installing unverified code from a public source.
6. Select Install. n8n installs the node, and returns to the Community Nodes list in Settings.

## Task Operations

### 1. Create a Task

    Parameters:

    - Task Title (required)
    - Task Content
    - Description of Checklist
    - All day
    - Start date
    - Due date
   
    >> use Additional Fields or JSON Parameters
    >> Subtasks will be part of the next release

### 2. Get Task By Project ID And Task ID

    Parameters:

    - Task identifier (required)
    - Project identifier (required)

### 3. Update a Task

    Parameters:

    - Task identifier (required)
    - Project identifier (required)
    - Task Title
    - Task Content
    - Description of Checklist
    - All day
    - Start date
    - Due date

    >> use Additional Fields or JSON Parameters

### 4. Complete a Task

    Parameters:

    - Task identifier (required)
    - Project identifier (required)

### 5. Delete a Task

    Parameters:

    - Task identifier (required)
    - Project identifier (required)

## Project Operations

### 1. Create a Project

    Parameters:

    - Name (required)
    - Color
    - View Mode (List, Kanban, Timeline)
    - Kind (Task, Note)

    >> use Additional Fields or JSON Parameters

### 2. Get User Project

    Empty Parameters

### 3. Get Project by ID

    Parameters:

    - Project identifier (required)

### 4. Get Project with Data

    Parameters:

    - Project identifier (required)

### 5. Update a Project

    Parameters:

    - Project identifier (required)
    - Name
    - Color
    - View Mode (List, Kanban, Timeline)
    - Kind (Task, Note)

    >> use Additional Fields or JSON Parameters

### 6. Delete a Project

    Parameters:

    - Project identifier (required)

## Credentials

1. Add credential in your n8n instance and select **TickTick OAuth2 API**
2. Visit: [TickTick Developer](https://developer.ticktick.com/)
3. Manage Apps > New App
4. Copy **Client ID** and **Client Secret** > Paste in n8n credential
5. Allow connection
6. Account connected

## Compatibility

Successfully tested on 2025-03-31 with:

- n8n Version: 1.85.4
- Node Version: 22.14.0
- pnpm Version: 9.1.4
- No extra packages required

## Known Issues

### Start date / Due date Parameter

Both parameters will be implemented correctly in the next release. 
Until then, please refer to the TickTick API documentation for the correct input: 

startDate Parameter:
Subtask start date time in "yyyy-MM-dd'T'HH:mm:ssZ"
Example : "2019-11-13T03:00:00+0000"

dueDate Parameter:
Task due date time in "yyyy-MM-dd'T'HH:mm:ssZ"
Example : "2019-11-13T03:00:00+0000"

### TickTick API Response for Certain Requests

As of the current version of this project, it's important for users to be aware that the TickTick API has specific behaviors regarding the responses for certain operations. Notably:

- **No Content Responses**: For some operations, such as deleting a project or completing a task, the TickTick API returns an HTTP status code indicating success (e.g., `200 OK`) but does not include any response body. This means that while these operations can be successfully executed, the API does not provide additional data or confirmation in the response body.

- **Handling of API Responses**: This custom node has been designed to interpret HTTP status codes as indicators of the success or failure of an operation. Since no further details are provided by the API for certain requests, the node generates its own success messages for user feedback. Users should rely on these status codes and custom messages for confirmation of operation outcomes.

- **API Documentation Discrepancies**: Users may also encounter instances where the behavior of the TickTick API does not fully align with its documentation, particularly regarding the response data for certain requests. We recommend users to proceed with caution and validate the functionality through testing, especially for critical workflows.

This project's implementation takes these API characteristics into account, aiming to provide clear and useful feedback to users whenever possible. However, users are encouraged to conduct their own testing and verification to ensure the node meets their specific needs.

Future updates to the TickTick API may address these issues, and subsequent versions of this project will aim to incorporate any changes to enhance functionality and user experience.

## Resources

- [n8n Website](https://n8n.io/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API documentation](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick.git)

## Version history

- `1.0.0` Initial release
