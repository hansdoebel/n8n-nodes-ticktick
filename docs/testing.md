# Testing

Tests for the TickTick API using Bun test runner.

## Setup

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add your credentials:
   ```
   TICKTICK_USERNAME=your-email@example.com
   TICKTICK_PASSWORD=your-password
   ```

3. Disable 2FA on your TickTick account (not supported for testing)

## Running Tests

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
bun test auth         # Run specific test file
```

## Test Structure

### Integration Tests

| File | Coverage |
|------|----------|
| `auth.test.ts` | Authentication flow |
| `v2-user.test.ts` | User profile, status, preferences |
| `v2-tasks.test.ts` | Task operations (create, update, complete, delete) |
| `v2-projects.test.ts` | Project operations |
| `v2-projectGroups.test.ts` | Project group operations |
| `v2-tags.test.ts` | Tag operations (create, rename, merge, delete) |
| `v2-habits.test.ts` | Habit operations and check-ins |
| `v2-focus.test.ts` | Focus heatmap and distribution |
| `v2-sync.test.ts` | Sync endpoint |

### Unit Tests

Organized by resource in `tests/unit/`:

- **Helpers**: apiRequest, dates, generators
- **Focus**: 2 operation tests
- **Habits**: 8 operation tests
- **ProjectGroups**: 4 operation tests
- **Projects**: 5 operation tests
- **Sync**: 1 operation test
- **Tags**: 6 operation tests
- **Tasks**: 13 operation tests
- **User**: 3 operation tests

## Notes

- Session tokens are valid for ~24 hours
- Tests use centralized ENDPOINTS constants from `utils/endpoints.ts`
- Helper functions in `utils/testClient.ts` for authentication and API requests

## Writing New Tests

1. Create test file in appropriate directory (`tests/` for integration, `tests/unit/` for unit)
2. Import test utilities from `utils/testClient.ts`
3. Follow existing patterns for authentication and API calls
4. Use descriptive test names that indicate what's being tested
