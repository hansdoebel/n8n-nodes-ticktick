# API Reference

Operations are organized by resource. Each operation indicates which API version it uses.

- **V1** - Official TickTick Open API (works with all credential types)
- **V2** - Undocumented Session API (requires Session API credentials)

## Tasks

| Operation | API | Description |
|-----------|-----|-------------|
| Create | V1 | Create a new task with optional subtasks |
| Get | V1 | Get a specific task by ID |
| Update | V1 | Update task properties |
| Complete | V1 | Mark a task as complete |
| Delete | V1 | Delete a task |
| Assign | V2 | Assign task to a user (shared projects only) |
| List All | V2 | List all tasks across projects with filtering |
| List Completed | V2 | Get completed tasks in date range |
| List Deleted | V2 | Get deleted/trashed tasks |
| Move | V2 | Move task to different project |
| Set Parent | V2 | Set a parent task (create subtask relationship) |

## Projects

| Operation | API | Description |
|-----------|-----|-------------|
| Create | V1 | Create a new project |
| Get | V1 | Get all projects, a specific project, or project with tasks & columns |
| Update | V1 | Update project properties |
| Delete | V1 | Delete a project |
| Get Users | V2 | Get users in a shared/collaborative project |
| List Closed | V2 | Get all closed projects |

## Tags (V2 only)

| Operation | Description |
|-----------|-------------|
| Create | Create a new tag |
| Update | Update existing tag |
| Delete | Delete a tag |
| List | List all tags |
| Rename | Rename a tag |
| Merge | Merge tag into another |

## Habits (V2 only)

| Operation | Description |
|-----------|-------------|
| Create | Create a new habit |
| Get | Get a specific habit |
| Update | Update existing habit |
| Archive | Archive a habit |
| Unarchive | Unarchive a habit |
| Delete | Delete a habit |
| List | List all habits |
| Checkin | Record habit check-in |

## Focus (V2 only)

| Operation | Description |
|-----------|-------------|
| Get Heatmap | Get focus heatmap data for date range |
| Get Distribution | Get focus time distribution for date range |

## Project Groups (V2 only)

| Operation | Description |
|-----------|-------------|
| Create | Create a project group |
| Update | Update existing group |
| Delete | Delete a project group |
| List | List all project groups |

## User (V2 only)

| Operation | Description |
|-----------|-------------|
| Get Profile | Get user profile information |
| Get Status | Get user status |
| Get Preferences | Get user preferences |

## Sync (V2 only)

| Operation | Description |
|-----------|-------------|
| Sync All | Get all data (tasks, projects, tags, habits, etc.) |
