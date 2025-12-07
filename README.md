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

---

## 📁 Project Operations

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

---

## 🧰 Compatibility

Tested successfully on 2025-12-01 with:

- n8n Version: 1.121.3
- Node Version: 22.11.0
- pnpm Version: 9.1.4
- No extra packages required (Luxon is bundled)

---

## ⚠ Known Issues & Notes

### TickTick API Response for Certain Requests

As of the current version of this project, it's important for users to be aware that the TickTick API has specific behaviors regarding the responses for certain operations. Notably:

- **No Content Responses**: For some operations, such as deleting a project or completing a task, the TickTick API returns an HTTP status code indicating success (e.g., `200 OK`) but does not include any response body. This means that while these operations can be successfully executed, the API does not provide additional data or confirmation in the response body.

- **Handling of API Responses**: This custom node has been designed to interpret HTTP status codes as indicators of the success or failure of an operation. Since no further details are provided by the API for certain requests, the node generates its own success messages for user feedback. Users should rely on these status codes and custom messages for confirmation of operation outcomes.

- **API Documentation Discrepancies**: Users may also encounter instances where the behavior of the TickTick API does not fully align with its documentation, particularly regarding the response data for certain requests. We recommend users to proceed with caution and validate the functionality through testing, especially for critical workflows.

This project's implementation takes these API characteristics into account, aiming to provide clear and useful feedback to users whenever possible. However, users are encouraged to conduct their own testing and verification to ensure the node meets their specific needs.

Future updates to the TickTick API may address these issues, and subsequent versions of this project will aim to incorporate any changes to enhance functionality and user experience.

---

## 🔗 Resources

- [n8n Website](https://n8n.io/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TickTick Website](https://www.ticktick.com/)
- [TickTick Open API documentation](https://developer.ticktick.com/docs#/openapi)
- [GitHub Repository](https://github.com/hansdoebel/n8n-nodes-ticktick.git)

---

## 📜 Version History

- `1.2.2` – documentation and metadata update only
- `1.2.1` – Inbox support, API Token credential, improved task/project operations, success messages
- `1.1.1` – Added Luxon for date formatting (thank you [mrozekadam](https://github.com/mrozekadam))
- `1.0.0` – Initial release
