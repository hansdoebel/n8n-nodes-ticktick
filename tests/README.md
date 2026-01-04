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
- Step 1: GET /signin to establish session cookie
- Step 2: POST /api/v2/user/signon to authenticate
- Verifies token extraction from response

### `v2-operations.test.ts`
Tests basic V2 API operations:
- GET /user/preferences - Get user preferences
- GET /user/profile - Get user profile
- GET /batch/check/0 - Initial sync (returns projects, tasks, tags, etc.)
- GET /projects - List all projects
- GET /tags - List all tags
- GET /habits - List all habits

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
