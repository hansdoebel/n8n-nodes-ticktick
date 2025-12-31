# n8n-nodes-ticktick

n8n community node for integrating TickTick with your workflows. Manage tasks, projects, and productivity seamlessly.

## Table of Contents

- [Installation](#installation)  
- [Credentials](#credentials)  
- [Task Operations](#task-operations)  
- [Project Operations](#project-operations)  
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

### TickTick API Token (recommended)

1. In TickTick: Account Settings → API Token → "Manage"
2. Copy token
3. In n8n: Create new credential → **TickTick API Token** → Paste token → Save

### TickTick OAuth2

1. Visit [TickTick Developer](https://developer.ticktick.com/) → Manage Apps → New App
2. Copy **Client ID** & **Client Secret**
3. In n8n: Create new credential → **TickTick OAuth2 API** → Paste credentials → Connect


## Task Operations

| Operation | Required Parameters | Optional/Additional Fields |
|-----------|-------------------|--------------------------|
| **Create** | Title | Project, All Day, Content, Description, Due Date, Priority, Reminders, Start Date, Status, Items (Subtasks) |
| **Get** | Task ID, Project ID | — |
| **Update** | Task ID | Project ID, Title, Content, Description, Due Date, Priority, Reminders, Start Date, Status, Items, All Day |
| **Complete** | Task ID, Project ID | — |
| **Delete** | Task ID, Project ID | — |

## Project Operations

| Operation | Mode/Type | Required Parameters | Optional Fields |
|-----------|-----------|-------------------|-----------------|
| **Create** | — | Project Name | Color, Kind, Sort Order, View Mode |
| **Get** | All Projects | — | — |
| **Get** | Specific Project | Project ID | — |
| **Get** | With Tasks & Columns | Project ID | — |
| **Update** | — | Project ID | Name, Color, Kind, Sort Order, View Mode |
| **Delete** | — | Project ID | — |

## Compatibility

Tested successfully on 2025-12-07 with:

- n8n Version: 1.121.3
- Node Version: 22.11.0
- pnpm Version: 9.1.4
- No extra packages required (Luxon is bundled)

## Known Issues

- **Inbox Handling**: The "Default Inbox" is handled internally as the "inbox" ID. It supports fetching data (tasks) but does not support "Get Specific Project" details as it is not a standard project.
- **Empty Responses**: Operations like delete or complete often return `200 OK` with no body. This node generates a success message for these cases.
- **Unofficial Node**: Community-maintained node. Not affiliated with or endorsed by TickTick or n8n.

## Resources

- [n8n Website](https://n8n.io/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick)
- [ticktick-sdk](https://github.com/dev-mirzabicer/ticktick-sdk)

## Version History

- `1.3.0` – Major refactor: Fixed API request context, added Inbox support, expanded Task/Project fields, added Subtask support, improved Project Get modes.
- `1.2.2` – documentation and metadata update only
- `1.2.1` – Inbox support, API Token credential, improved task/project operations, success messages
- `1.1.1` – Added Luxon for date formatting (thank you [mrozekadam](https://github.com/mrozekadam))
- `1.0.0` – Initial release
