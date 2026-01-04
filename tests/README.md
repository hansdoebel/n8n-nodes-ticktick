# TickTick V2 API Tests

This directory contains tests for the TickTick V2 API authentication and operations.

## Setup

1. Copy the `.env.example` file to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your TickTick credentials:
   ```
   TICKTICK_USERNAME=your-email@example.com
   TICKTICK_PASSWORD=your-password
   ```

   **Important:** Make sure you use your TickTick account email as the username.

3. Ensure 2FA (Two-Factor Authentication) is **disabled** on your TickTick account for testing, as it's not currently supported in the session-based authentication flow.

## Running Tests

Run all tests:
```bash
pnpm test
```

Run authentication tests only:
```bash
pnpm test:auth
```

Run v2 operations tests only:
```bash
pnpm test:v2
```

Watch mode (re-runs tests on file changes):
```bash
pnpm test:watch
```

## Test Files

### `auth.test.ts`
Tests the authentication flow:
- Direct POST to `/api/v2/user/signon` with Python-style JSON formatting
- Verifies token extraction from response

### `v2-user.test.ts`
Tests the V2 user resource using session auth:
- GET /user/profile
- GET /user/status
- GET /user/preferences

### `v2-projects.test.ts`
Tests the V2 projects resource:
- GET /projects

### `v2-tags.test.ts`
Tests the V2 tags resource:
- GET /tags

### `v2-habits.test.ts`
Tests the V2 habits resource:
- GET /habits

### `v2-sync.test.ts`
Tests the V2 sync resource:
- GET /batch/check/0

### `v2-tasks.test.ts`
Tests the V2 tasks resource:
- GET /project/all/trash/pagination

## Debugging

The tests include console logging to help debug authentication issues:
- Session cookies obtained
- Authentication response details
- Token information
- API response data

If authentication fails, check:
1. Credentials are correct in `.env`
2. 2FA is disabled on your account
3. No rate limiting or IP blocking from TickTick
4. The TickTick API hasn't changed (compare with the [TickTick SDK](https://github.com/dev-mirzabicer/ticktick-sdk))

## Notes

- Tests use the native Node.js `https` module instead of external libraries to avoid n8n-specific dependencies
- Each test has a 10-15 second timeout to account for network latency
- Session tokens are valid for ~24 hours according to TickTick's behavior
