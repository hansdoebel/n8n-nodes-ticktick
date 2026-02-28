<h1 align="center">
  <br>
  n8n-nodes-ticktick
  <br>
</h1>

<p align="center">
	<img alt="NPM Version" src="https://img.shields.io/npm/v/n8n-nodes-ticktick">
	<img alt="GitHub License" src="https://img.shields.io/github/license/hansdoebel/n8n-nodes-ticktick">
	<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/n8n-nodes-ticktick">
	<img alt="NPM Last Update" src="https://img.shields.io/npm/last-update/n8n-nodes-ticktick">
	<img alt="Static Badge" src="https://img.shields.io/badge/n8n-2.9.4-EA4B71?logo=n8n">
</p>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#credentials">Credentials</a> |
  <a href="#resources">Resources</a> |
  <a href="#development">Development</a> |
  <a href="#contributors">Contributors</a> |
  <a href="#license">License</a>
</p>

---

An n8n community node for integrating [TickTick](https://ticktick.com) with your workflows to manage tasks, projects, tags, habits, focus time, and more.

## Installation

1. Make a new workflow or open an existing one
2. Open the nodes panel by selecting **+** or pressing **Tab**
3. Search for **TickTick**
4. Select **Install** to install the node for your instance

## Credentials

This node supports three authentication methods:

1. **TickTick Session API (V2)** -- Enter your TickTick email and password in n8n. Provides access to all features including V2 API operations. Session tokens are managed automatically.
2. **TickTick API Token (V1)** -- Go to TickTick Account Settings, then API Token, then Manage. Copy the token and paste it into a new TickTick API Token credential in n8n.
3. **TickTick OAuth2 (V1)** -- Visit [developer.ticktick.com](https://developer.ticktick.com/), go to Manage Apps, create a new app, copy the Client ID and Client Secret, and paste them into a new TickTick OAuth2 API credential in n8n.

## Resources

<details>
<summary><strong>Task</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new task with optional subtasks |
| Get | Get a specific task by ID |
| Update | Update task properties |
| Complete | Mark a task as complete |
| Delete | Delete a task |
| Assign | Assign task to a user (shared projects only) |
| List All | List all tasks across projects with filtering |
| List Completed | Get completed tasks in date range |
| List Deleted | Get deleted/trashed tasks |
| Move | Move task to different project |
| Set Parent | Set a parent task (create subtask relationship) |

</details>

<details>
<summary><strong>Project</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new project |
| Get | Get all projects, a specific project, or project with tasks and columns |
| Update | Update project properties |
| Delete | Delete a project |
| Get Users | Get users in a shared/collaborative project |
| List Closed | Get all closed projects |

</details>

<details>
<summary><strong>Tag</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new tag |
| Update | Update existing tag |
| Delete | Delete a tag |
| List | List all tags |
| Rename | Rename a tag |
| Merge | Merge tag into another |

</details>

<details>
<summary><strong>Habit</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a new habit |
| Get | Get a specific habit |
| Update | Update existing habit |
| Archive | Archive a habit |
| Unarchive | Unarchive a habit |
| Delete | Delete a habit |
| List | List all habits |
| Checkin | Record habit check-in |

</details>

<details>
<summary><strong>Focus</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Get Heatmap | Get focus heatmap data for date range |
| Get Distribution | Get focus time distribution for date range |

</details>

<details>
<summary><strong>Project Group</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a project group |
| Update | Update existing group |
| Delete | Delete a project group |
| List | List all project groups |

</details>

<details>
<summary><strong>User</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Get Profile | Get user profile information |
| Get Status | Get user status |
| Get Preferences | Get user preferences |

</details>

<details>
<summary><strong>Sync</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Sync All | Get all data (tasks, projects, tags, habits, etc.) |

</details>

## Development

```bash
git clone https://github.com/hansdoebel/n8n-nodes-ticktick.git
cd n8n-nodes-ticktick
npm install
npm run build
npm run lint
```

## Contributors

Contributions are welcome! Please open an [issue](https://github.com/hansdoebel/n8n-nodes-ticktick/issues) or [pull request](https://github.com/hansdoebel/n8n-nodes-ticktick/pulls).

<p align="left">
    <a href="https://github.com/mrozekadam"><img src="https://avatars.githubusercontent.com/u/56890953?v=4&s=48" width="48" height="48" alt="mrozekadam" title="mrozekadam"/></a><a href="https://github.com/kazhuravlev"><img src="https://avatars.githubusercontent.com/u/7666955?v=4&s=48" width="48" height="48" alt="kazhuravlev" title="kazhuravlev"/></a>
</p>

## License

[MIT](LICENSE.md)

<p align="center">
  <a href="https://github.com/hansdoebel/n8n-nodes-ticktick">GitHub</a> |
  <a href="https://github.com/hansdoebel/n8n-nodes-ticktick/issues">Issues</a> |
  <a href="https://developer.ticktick.com">TickTick API Docs</a>
</p>
