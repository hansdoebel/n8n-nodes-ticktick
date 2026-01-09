# TickTick V2 API Tests

Tests for the TickTick V2 API using Bun test runner.

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

## Test Coverage

- `auth.test.ts` - Authentication flow
- `v2-user.test.ts` - User profile, status, preferences
- `v2-tasks.test.ts` - Task operations (create, update, complete, delete)
- `v2-projects.test.ts` - Project operations
- `v2-projectGroups.test.ts` - Project group operations
- `v2-tags.test.ts` - Tag operations (create, rename, merge, delete)
- `v2-habits.test.ts` - Habit operations and check-ins
- `v2-focus.test.ts` - Focus heatmap and distribution
- `v2-sync.test.ts` - Sync endpoint

## Notes

- Session tokens valid for ~24 hours
- Tests use centralized ENDPOINTS constants from `utils/endpoints.ts`
- Helper functions in `utils/testClient.ts` for authentication and API requests
