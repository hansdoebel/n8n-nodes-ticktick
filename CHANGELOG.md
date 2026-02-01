# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-02-01

### Added
- "Set Parent" operation for tasks to create subtask relationships
- Dynamic tag search in task update showing only current task tags
- Options to clear selected fields in task update
- Ability to remove specific tags from tasks
- Unit tests for all operations

### Fixed
- Sidebar action panel now correctly groups actions by resource
- All resources visible in dropdown regardless of credential type (with notices for V2-only resources)

## [2.1.0]

### Added
- "Get Users" operation for projects to list users in shared/collaborative projects
- "Assign" operation for tasks to assign tasks to users in shared projects
- Assignee field supports dropdown selection from project users

## [2.0.3]

### Changed
- Complete codebase restructure with resource registry pattern
- Barrel exports for cleaner imports
- Centralized TypeScript types and constants

### Added
- Habits resource (create, get, update, archive, unarchive, delete, list, checkin)
- Focus resource (heatmap, distribution)
- Project Groups resource (create, update, delete, list)
- User resource (profile, status, preferences)
- Tag rename and merge operations
- Comprehensive test suite with 34+ tests

### Improved
- API implementations matching Python SDK reference

## [2.0.0]

### Added
- TickTick Session API (email/password) authentication
- Support for undocumented V2 endpoints
- Tags resource (create, update, delete, list)
- Sync resource (sync all)
- V2-only task operations: List All, List Completed, List Deleted, Move

### Changed
- All V1 operations now support both V1 and V2 authentication methods

## [1.0.0]

### Added
- Initial release
- Task operations: Create, Get, Update, Complete, Delete
- Project operations: Create, Get, Update, Delete
- TickTick API Token authentication
- TickTick OAuth2 authentication
