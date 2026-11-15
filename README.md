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
	<img alt="Static Badge" src="https://img.shields.io/badge/n8n-2.47.7-EA4B71?logo=n8n">
</p>

<div align="center">

[![Greptile: The War on Bugs](https://www.greptile.com/badge.svg)](https://www.greptile.com/?utm_source=oss_badge&utm_medium=readme&utm_campaign=greptile_for_open_source)

</div>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#credentials">Credentials</a> |
  <a href="#resources">Resources</a> |
  <a href="#troubleshooting">Troubleshooting</a> |
  <a href="#development">Development</a> |
  <a href="#version-history">Version history</a> |
  <a href="#contributors">Contributors</a> |
  <a href="#license">License</a>
</p>

---

An n8n community node for integrating [TickTick](https://ticktick.com) with your workflows to manage tasks, projects, tags, habits, focus time, and more.

## Installation

1. Create a new workflow or open an existing one
2. Open the nodes panel by selecting **+** or pressing **N**
3. Search for **TickTick**
4. Select **Install** to install the node for your instance

## Credentials

This node supports three authentication methods:

1. **TickTick Session API (V2)** -- Enter your TickTick email and password in n8n. Provides access to all features including V2 API operations. A successful sign-on is cached in memory for about 23 hours and is keyed by the email and password, so changing the password signs on again. Failed sign-ons are cached too: rejected credentials for 10 minutes, and network or server errors for 30 seconds. That backoff avoids repeated attempts that can lock the TickTick account. Sign-on errors keep TickTick's error code and the HTTP status, and they do not include the email or the password.
2. **TickTick API Token (V1)** -- Go to TickTick Account Settings, then API Token, then Manage. Copy the token and paste it into a new TickTick API Token credential in n8n.
3. **TickTick OAuth2 (V1)** -- Visit [developer.ticktick.com](https://developer.ticktick.com/), go to Manage Apps, create a new app, copy the Client ID and Client Secret, and paste them into a new TickTick OAuth2 API credential in n8n. New credentials request the `tasks:read` and `tasks:write` scopes.

## Troubleshooting

**Sign-in fails with `need_upgrade_client`**

TickTick rejects an outdated V2 web client during session sign-on. The response is HTTP 500 with error code `need_upgrade_client`. This node sends device version `8240` in the `X-Device` header, matching the current TickTick web client. If TickTick still returns that error, the node reports: "TickTick requires a newer client version…"

**Wrong email or password**

TickTick often answers `username_password_not_match` and puts the account email in `errorMessage`. The node reports the error code and HTTP status without the email or the password. A rejected sign-on is not retried for 10 minutes. TickTick itself can lock the account after repeated wrong passwords, including attempts made outside n8n.

**TickTick Trigger**

The trigger polls for newly created tasks. It is not offered as an AI tool. The TickTick action node still is.

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
| Search | Search tasks by keyword across all projects (V2 API only) |
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
bun install --frozen-lockfile
bun run build
bun run lint
bun test tests/unit
```

Use Bun 1.4 or newer. The lockfile is version 2.

## Version history

### 2.3.0

- V2 session sign-on no longer puts the account email or the password in errors or in the credential test result. TickTick's error code and the HTTP status are kept. `username_password_not_match` often sends the email back as `errorMessage`; that value is removed.
- V2 sessions are cached in memory by email and password. Rejected credentials are not retried for 10 minutes. Network and server errors are not retried for 30 seconds. Concurrent calls share one in-flight sign-on.
- OAuth2 credentials request `tasks:read tasks:write`.
- The TickTick Trigger node is no longer available as an AI tool.
- Publish workflow uses pinned GitHub Actions, including checkout 7.0.1 and setup-node 7.1.0, and publishes with npm trusted publishing.

### 2.2.3

- V2 sign-on `X-Device` version bumped to `8240` to fix `need_upgrade_client` sign-in failures ([#25](https://github.com/hansdoebel/n8n-nodes-ticktick/issues/25), PR [#26](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/26) by [@eps90](https://github.com/eps90))
- Clearer error message when TickTick requires a newer client version, including when sign-on fails with HTTP 500
- Integration tests share the production device version

## Contributors

Contributions are welcome! Please open an [issue](https://github.com/hansdoebel/n8n-nodes-ticktick/issues) or [pull request](https://github.com/hansdoebel/n8n-nodes-ticktick/pulls).

<p align="left">
    <a href="https://github.com/mrozekadam"><img src="https://avatars.githubusercontent.com/u/56890953?v=4&s=48" width="48" height="48" alt="mrozekadam" title="mrozekadam"/></a><a href="https://github.com/kazhuravlev"><img src="https://avatars.githubusercontent.com/u/7666955?v=4&s=48" width="48" height="48" alt="kazhuravlev" title="kazhuravlev"/></a><a href="https://github.com/eps90"><img src="https://avatars.githubusercontent.com/u/1702899?v=4&s=48" width="48" height="48" alt="eps90" title="eps90"/></a>
</p>

## License

[MIT](LICENSE.md)

<p align="center">
  <a href="https://github.com/hansdoebel/n8n-nodes-ticktick">GitHub</a> |
  <a href="https://github.com/hansdoebel/n8n-nodes-ticktick/issues">Issues</a> |
  <a href="https://developer.ticktick.com">TickTick API Docs</a>
</p>
