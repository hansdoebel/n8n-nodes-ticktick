# n8n-nodes-ticktick

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

This is an n8n community node. It lets you use TickTick in your n8n workflows.

TickTick is a comprehensive productivity app designed to help individuals and teams manage tasks, deadlines, and projects more efficiently. With its intuitive interface, TickTick allows users to easily create, organize, and prioritize tasks, set reminders, and track progress through various views such as lists, kanban boards, and calendars.

---

[Installation](#installation)  
[Task Operations](#task-operations)  
[Project Operations](#projectoperations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Known Issues](#known-issues)  
[Resources](#resources)  
[Version history](#version-history)

## 📦 Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes.**
2. Select **Install.**
3. Type `n8n-nodes-ticktick` (and version number if required) into **npm Package Name** field
5. Agree to the risks of using community nodes: select I understand the risks of installing unverified code from a public source.
6. Select Install. n8n installs the node, and returns to the Community Nodes list in Settings.

---

## 🔑 Credentials

This node supports **two authentication types**:

### 1️⃣ TickTick API Token (recommended)

Steps:
1. In TickTick: Account Settings → API Token → "Manage"
2. Copy token
3. Create credential in n8n → **TickTick API Token**
4. Paste token → Save


### 2️⃣ TickTick OAuth2

Steps:
1. Add credential in your n8n instance and select **TickTick OAuth2 API**
2. Visit: [TickTick Developer](https://developer.ticktick.com/)
3. Go to Manage Apps → New App
4. Copy **Client ID** & **Client Secret**
5. In n8n, create credential **TickTick OAuth2 API**
6. Paste credentials & connect

---

## 🧩 Task Operations

### 1. Create a Task

    Parameters:
    - Title (required)
    - Project (defaults to Inbox if empty)
    - Additional Fields:
      - All Day, Completed Time, Content, Description, Due Date, Kind, Priority, Reminders, Repeat Flag, Sort Order, Start Date, Status, Time Zone
      - Items (Subtasks)

### 2. Get Task

    Parameters:
    - Task identifier (required)
    - Project identifier (required)

### 3. Update a Task

    Parameters:
    - Task ID (required)
    - Project ID (optional - preserves current project if empty)
    - Update Fields:
      - All Day, Completed Time, Content, Description, Due Date, Items, Priority, Reminders, Repeat Flag, Sort Order, Start Date, Status, Time Zone, Title

### 4. Complete a Task

    Parameters:
    - Task identifier (required)
    - Project identifier (required)

### 5. Delete a Task

    Parameters:
    - Task identifier (required)
    - Project identifier (required)
    
---

## 📁 Project Operations

### 1. Create a Project

    Parameters:
    - Project Name (required)
    - Additional Fields: Color, Kind, Sort Order, View Mode

### 2. Get Project(s)

    Modes:
    - Get All Projects: Retrieve a list of all projects
    - Get Specific Project: Retrieve details of a single project (Name, Color, etc.)
    - Get Project With Data: Retrieve a project along with its tasks and columns (Works for Inbox)

### 3. Update a Project

    Parameters:
    - Project ID (required)
    - Update Fields: Color, Kind, Name, Sort Order, View Mode

### 4. Delete a Project

    Parameters:
    - Project ID (required)
    

---

## 🧰 Compatibility

Tested successfully on 2025-12-07 with:

- n8n Version: 1.121.3
- Node Version: 22.11.0
- pnpm Version: 9.1.4
- No extra packages required (Luxon is bundled)

---

## ⚠ Known Issues & Notes

### API Behavior
- **Inbox Handling**: The "Default Inbox" is handled internally as the "inbox" ID. It supports fetching data (tasks) but does not support "Get Specific Project" details as it is not a standard project.
- **Empty Responses**: Operations like delete or complete often return `200 OK` with no body. This node generates a success message for these cases.

---

## 🔗 Resources

- [n8n Website](https://n8n.io/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API documentation](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick.git)

---

## 📜 Version History

- `1.3.0` – Major refactor: Fixed API request context, added Inbox support, expanded Task/Project fields, added Subtask support, improved Project Get modes.
- `1.2.2` – documentation and metadata update only
- `1.2.1` – Inbox support, API Token credential, improved task/project operations, success messages
- `1.1.1` – Added Luxon for date formatting (thank you [mrozekadam](https://github.com/mrozekadam))
- `1.0.0` – Initial release
