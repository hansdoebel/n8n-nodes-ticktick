# n8n-nodes-ticktick

n8n community node for integrating TickTick with your workflows. Manage tasks, projects, tags, habits, and productivity seamlessly.

## Table of Contents

- [Installation](#installation)
- [Credentials](#credentials)
- [TickTick V1 API (Official)](#ticktick-v1-api-official)
- [TickTick V2 API (Undocumented)](#ticktick-v2-api-undocumented-session-api)
- [Compatibility](#compatibility)
- [Known Issues](#known-issues)
- [Resources](#resources)
- [Version History](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes.**
2. Select **Install.**
3. Type `n8n-nodes-ticktick` (and version number if required) into **npm Package Name** field
5. Agree to the risks of using community nodes: select I understand the risks of installing unverified code from a public source.
6. Select Install. n8n installs the node, and returns to the Community Nodes list in Settings.

## Credentials

### TickTick Session API (V2) - Email/Password

For access to V2 API features (sync, tags, habits, focus, etc.):

1. In n8n: Create new credential → **TickTick Session API**
2. Enter your TickTick **email** and **password**
3. Save

**Note**: This authentication method provides access to TickTick's undocumented V2 API, which offers more features than the official V1 API.

### TickTick API Token (V1) - Recommended for V1 API

1. In TickTick: Account Settings → API Token → "Manage"
2. Copy token
3. In n8n: Create new credential → **TickTick API Token** → Paste token → Save

### TickTick OAuth2 (V1)

1. Visit [TickTick Developer](https://developer.ticktick.com/) → Manage Apps → New App
2. Copy **Client ID** & **Client Secret**
3. In n8n: Create new credential → **TickTick OAuth2 API** → Paste credentials → Connect

## TickTick V1 API (Official)

The following operations use the official TickTick Open API (V1) and work with **API Token** or **OAuth2** credentials.

### Task Operations (V1)

- **Create** - Create a new task with optional subtasks
- **Get** - Get a specific task by ID
- **Update** - Update task properties
- **Complete** - Mark a task as complete
- **Delete** - Delete a task

### Project Operations (V1)

- **Create** - Create a new project
- **Get** - Get all projects, a specific project, or project with tasks & columns
- **Update** - Update project properties
- **Delete** - Delete a project

## TickTick V2 API (Undocumented Session API)

The following operations require **TickTick Session API** (Email/Password) credentials and provide access to advanced features not available in the V1 API.

> **Note**: V2 authentication also supports all V1 task operations (Create, Get, Update, Complete, Delete) and all V1 project operations (Create, Get, Update, Delete). The operations listed below are **additional V2-only features** not available with V1 API Token or OAuth2 credentials.

### Task Operations (V2 Only)

- **Assign** - Assign task to a user (shared projects only)
- **List All** - List all tasks across projects with filtering
- **List Completed** - Get completed tasks in date range
- **List Deleted** - Get deleted/trashed tasks
- **Move** - Move task to different project
- **Set Parent** - Set a parent task (create subtask relationship)

### Project Operations (V2 Only)

- **Get Users** - Get users in a shared/collaborative project
- **List Closed** - Get all closed projects

### Tag Operations (V2)

- **Create** - Create a new tag
- **Update** - Update existing tag
- **Delete** - Delete a tag
- **List** - List all tags
- **Rename** - Rename a tag
- **Merge** - Merge tag into another

### Habit Operations (V2)

- **Create** - Create a new habit
- **Get** - Get a specific habit
- **Update** - Update existing habit
- **Archive** - Archive a habit
- **Unarchive** - Unarchive a habit
- **Delete** - Delete a habit
- **List** - List all habits
- **Checkin** - Record habit check-in

### Focus Operations (V2)

- **Get Heatmap** - Get focus heatmap data for date range
- **Get Distribution** - Get focus time distribution for date range

### Project Group Operations (V2)

- **Create** - Create a project group
- **Update** - Update existing group
- **Delete** - Delete a project group
- **List** - List all project groups

### User Operations (V2)

- **Get Profile** - Get user profile information
- **Get Status** - Get user status
- **Get Preferences** - Get user preferences

### Sync Operations (V2)

- **Sync All** - Get all data (tasks, projects, tags, habits, etc.)

## Compatibility

Tested with n8n 2.4.8, Node 22.21.1, Bun 1.3.8 (2026-02-01)

## Known Issues

### V1 API (Official)
- **Inbox Handling**: The "Default Inbox" is handled internally as the "inbox" ID. It supports fetching data (tasks) but does not support "Get Specific Project" details as it is not a standard project.
- **Empty Responses**: Operations like delete or complete often return `200 OK` with no body. This node generates a success message for these cases.

### V2 API (Undocumented)
- **Undocumented API**: The V2 Session API is not officially documented by TickTick. Endpoints were discovered through reverse engineering and may change without notice. Use at your own risk.
- **Authentication**: Session API requires email/password credentials. These are stored securely by n8n but consider the security implications for your use case.

### General
- **Unofficial Node**: Community-maintained node. Not affiliated with or endorsed by TickTick or n8n.

## Resources

- [n8n Website](https://n8n.io/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick)

## Version History

- `2.1.2` – **Set Parent & Task Update Enhancements**: Added "Set Parent" operation for tasks to create subtask relationships. Enhanced task update with dynamic tag search showing only current task tags, options to clear selected fields, and ability to remove specific tags. Added unit tests for all operations.
- `2.1.0` – **Collaboration Features**: Added "Get Users" operation for projects to list users in shared/collaborative projects. Added "Assign" operation for tasks to assign tasks to users in shared projects. Assignee field supports dropdown selection from project users.
- `2.0.3` – **Major Refactor & New Resources**: Complete codebase restructure with resource registry pattern, barrel exports, TypeScript types, centralized constants. New resources: Habits (with check-ins), Focus (heatmap & distribution), Project Groups, User (profile/status/preferences). Enhanced tag operations (rename, merge). Improved API implementations matching Python SDK reference. Comprehensive test suite with 34+ tests.
- `2.0.0` – **V2 API Support**: Added TickTick Session API (email/password) authentication with support for undocumented V2 endpoints. New resources: Tags, Sync. New V2-only task operations: List All, List Completed, List Deleted, Move. All V1 operations now support both V1 and V2 authentication methods.
