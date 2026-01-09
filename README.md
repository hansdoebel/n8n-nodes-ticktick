# n8n-nodes-ticktick

n8n community node for integrating TickTick with your workflows. Manage tasks, projects, tags, habits, and productivity seamlessly.

## Table of Contents

- [Installation](#installation)  
- [Credentials](#credentials)  
- [Task Operations](#task-operations)  
- [Project Operations](#project-operations)  
- [Tag Operations](#tag-operations)  
- [Habit Operations](#habit-operations)  
- [Focus Operations](#focus-operations)  
- [Project Group Operations](#project-group-operations)  
- [User Operations](#user-operations)  
- [Sync Operations](#sync-operations)  
- [Compatibility](#compatibility)  
- [Known Issues](#known-issues)  
- [Development Notes](#development-notes)  
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

---

## TickTick V1 API (Official)

The following operations use the official TickTick Open API (V1) and work with **API Token** or **OAuth2** credentials.

### Task Operations (V1)

| Operation | Required Parameters | Optional/Additional Fields |
|-----------|-------------------|--------------------------|
| **Create** | Title | Project, All Day, Content, Description, Due Date, Priority, Reminders, Start Date, Status, Items (Subtasks) |
| **Get** | Task ID, Project ID | — |
| **Update** | Task ID | Project ID, Title, Content, Description, Due Date, Priority, Reminders, Start Date, Status, Items, All Day |
| **Complete** | Task ID, Project ID | — |
| **Delete** | Task ID, Project ID | — |

### Project Operations (V1)

| Operation | Mode/Type | Required Parameters | Optional Fields |
|-----------|-----------|-------------------|-----------------|
| **Create** | — | Project Name | Color, Kind, Sort Order, View Mode |
| **Get** | All Projects | — | — |
| **Get** | Specific Project | Project ID | — |
| **Get** | With Tasks & Columns | Project ID | — |
| **Update** | — | Project ID | Name, Color, Kind, Sort Order, View Mode |
| **Delete** | — | Project ID | — |

---

## TickTick V2 API (Undocumented Session API)

The following operations require **TickTick Session API** (Email/Password) credentials and provide access to advanced features not available in the V1 API.

> **Note**: V2 authentication also supports all V1 task operations (Create, Get, Update, Complete, Delete) and all V1 project operations (Create, Get, Update, Delete). The operations listed below are **additional V2-only features** not available with V1 API Token or OAuth2 credentials.

### Task Operations (V2 Only)

| Operation | Description | Required Parameters | Optional/Additional Fields |
|-----------|-------------|-------------------|--------------------------|
| **List All** | List all tasks across projects | — | Limit, Project Filter, Status Filter (All/Active/Completed), Include Deleted |
| **List Completed** | Get completed tasks in date range | — | Limit, Date Range (From/To) |
| **List Deleted** | Get deleted/trashed tasks | — | Limit |
| **Move** | Move task to different project | Task, To Project | — |

### Project Operations (V2 Only)

| Operation | Description | Required Parameters | Optional/Additional Fields |
|-----------|-------------|-------------------|--------------------------|
| **List Closed** | Get all closed projects | — | — |

### Tag Operations (V2)

| Operation | Description | Required Parameters | Optional Fields |
|-----------|-------------|-------------------|-----------------|
| **Create** | Create a new tag | Tag Name | Label, Sort Order, Color, Parent Tag |
| **Update** | Update existing tag | Tag | Name, Label, Sort Order, Color, Parent Tag |
| **Delete** | Delete a tag | Tag | — |
| **List** | List all tags | — | — |
| **Rename** | Rename a tag | Tag, New Name | — |
| **Merge** | Merge tag into another | Source Tag, Target Tag | — |

### Habit Operations (V2)

| Operation | Description | Required Parameters | Optional Fields |
|-----------|-------------|-------------------|-----------------|
| **Create** | Create a new habit | Habit Name | Type (Boolean/Real), Color, Icon, Repeat Rule, Target Days, Archived Days, Goal |
| **Get** | Get a specific habit | Habit | — |
| **Update** | Update existing habit | Habit | Name, Type, Color, Icon, Repeat Rule, Target Days, Archived Days, Goal |
| **Archive** | Archive a habit | Habit | — |
| **Unarchive** | Unarchive a habit | Habit | — |
| **Delete** | Delete a habit | Habit | — |
| **List** | List all habits | — | — |
| **Checkin** | Record habit check-in | Habit, Date | Value (for Real type habits) |

### Focus Operations (V2)

| Operation | Description | Required Parameters | Optional Fields |
|-----------|-------------|-------------------|-----------------|
| **Get Heatmap** | Get focus heatmap data | Start Date, End Date | — |
| **Get Distribution** | Get focus time distribution | Start Date, End Date | — |

### Project Group Operations (V2)

| Operation | Description | Required Parameters | Optional Fields |
|-----------|-------------|-------------------|-----------------|
| **Create** | Create a project group | Group Name | Sort Order, Sort Type |
| **Update** | Update existing group | Project Group | Name, Sort Order, Sort Type |
| **Delete** | Delete a project group | Project Group | — |
| **List** | List all project groups | — | — |

### User Operations (V2)

| Operation | Description | Returns |
|-----------|-------------|---------|
| **Get Profile** | Get user profile information | User details, settings, subscription info |
| **Get Status** | Get user status | Current status, activity data |
| **Get Preferences** | Get user preferences | UI settings, notification preferences |

### Sync Operations (V2)

| Operation | Description | Returns |
|-----------|-------------|---------|
| **Sync All** | Get all data from sync endpoint | Tasks, Projects, Tags, Habits, Project Groups, Column Data, User Info |

---

## Compatibility

Tested successfully on 2026-01-09 with:

- n8n Version: 2.2.3
- Node Version: 22.11.0
- Bun Version: 1.3.5
- No extra packages required (Luxon is bundled)

## Known Issues

### V1 API (Official)
- **Inbox Handling**: The "Default Inbox" is handled internally as the "inbox" ID. It supports fetching data (tasks) but does not support "Get Specific Project" details as it is not a standard project.
- **Empty Responses**: Operations like delete or complete often return `200 OK` with no body. This node generates a success message for these cases.

### V2 API (Undocumented)
- **Undocumented API**: The V2 Session API is not officially documented by TickTick. Endpoints and behaviors were discovered through reverse engineering and may change without notice.
- **Rate Limits Unknown**: Rate limiting behavior for the V2 API is undocumented and unknown. Use responsibly to avoid potential account issues.
- **No Official Support**: TickTick does not provide official support for the V2 Session API. Use at your own risk.
- **Authentication Security**: Session API requires email/password credentials. These are stored securely by n8n but consider the security implications for your use case.
- **Breaking Changes**: Since the API is undocumented, TickTick may change endpoints or behavior at any time without warning.

### General
- **Unofficial Node**: Community-maintained node. Not affiliated with or endorsed by TickTick or n8n.

## Development Notes

### Kill n8n Process

Add this alias to your `~/.zshrc` for quick n8n process termination during development:

```bash
alias kill-n8n="kill -9 \$(lsof -ti tcp:5678 -sTCP:LISTEN)"
```

After adding, reload your shell: `source ~/.zshrc`

### How to publish new release

```
# Bump the version
npm version patch|minor|major
```

```
# push the tag to GitHub
git push origin v1.2.3
```

### Add MCP Server to Zed IDE

"Add custom Server..." -> "Configure Remote" -> "Add Server"

```
{
  /// The name of your remote MCP server
  "n8n-mcp": {
    /// The URL of the remote MCP server
    "url": "http://localhost:5678/mcp-server/http",
    "headers": {
    /// Any headers to send along
    "Authorization": "Bearer <TOKEN>"
    }
  }
}
```
Available Tools:		
- execute_workflow	
- get_workflow_details
- search_workflows

## Resources

- [n8n Website](https://n8n.io/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [n8n Documentation for LLMs](https://docs.n8n.io/llms.txt)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick)
- [dev-mirzabicer/ticktick-sdk](https://github.com/dev-mirzabicer/ticktick-sdk)
- [lazeroffmichael/ticktick-py](https://github.com/lazeroffmichael/ticktick-py/)
- [@n8n/node-cli README](https://raw.githubusercontent.com/n8n-io/n8n/refs/heads/master/packages/%40n8n/node-cli/README.md)


## Version History

- `2.1.0` – **Major Refactor & New Resources**: Complete codebase restructure with resource registry pattern, barrel exports, TypeScript types, centralized constants. New resources: Habits (with check-ins), Focus (heatmap & distribution), Project Groups, User (profile/status/preferences). Enhanced tag operations (rename, merge). Improved API implementations matching Python SDK reference. Comprehensive test suite with 34+ tests.
- `2.0.0` – **V2 API Support**: Added TickTick Session API (email/password) authentication with support for undocumented V2 endpoints. New resources: Tags, Sync. New V2-only task operations: List All, List Completed, List Deleted, Move. All V1 operations now support both V1 and V2 authentication methods.
- `1.3.0` – Major refactor: Fixed API request context, added Inbox support, expanded Task/Project fields, added Subtask support, improved Project Get modes.
- `1.2.2` – Documentation and metadata update only
- `1.2.1` – Inbox support, API Token credential, improved task/project operations, success messages
- `1.1.1` – Added Luxon for date formatting (thank you [mrozekadam](https://github.com/mrozekadam))
- `1.0.0` – Initial release
