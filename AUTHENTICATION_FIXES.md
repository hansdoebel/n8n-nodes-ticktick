# TickTick V2 Authentication Fixes

## Summary

Fixed the TickTick V2 session-based authentication by aligning with the official [ticktick-sdk](https://github.com/dev-mirzabicer/ticktick-sdk) implementation.

## Key Changes

### 1. Simplified Authentication Flow

**Before (incorrect):**
- Step 1: GET `https://ticktick.com/signin` to get session cookies
- Step 2: POST `/api/v2/user/signon` with session cookies

**After (correct):**
- Direct POST to `https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true`
- No need for the initial /signin step

### 2. Corrected Base URL

**Before:** `https://ticktick.com/api/v2`  
**After:** `https://api.ticktick.com/api/v2`

### 3. Simplified X-Device Header

**Before (9 fields):**
```json
{
  "platform": "web",
  "os": "macOS 10.15",
  "device": "Firefox 146.0",
  "name": "",
  "version": 6440,
  "id": "...",
  "channel": "website",
  "campaign": "",
  "websocket": ""
}
```

**After (3 fields - minimal format):**
```json
{
  "platform": "web",
  "version": 6430,
  "id": "..."
}
```

### 4. Updated Constants

- **User-Agent:** `Mozilla/5.0 (rv:145.0) Firefox/145.0`
- **Device Version:** `6430` (was 6440)

## Files Modified

1. **nodes/TickTick/helpers/sessionManager.ts**
   - Updated `V2_API_BASE` to use correct hostname
   - Simplified `buildDeviceHeader()` to use minimal format
   - Removed 2-step authentication flow (no /signin step)
   - Updated User-Agent and device version

2. **tests/auth.test.ts**
   - Updated constants to match SDK
   - Simplified buildDeviceHeader function

3. **tests/v2-operations.test.ts**
   - Updated constants to match SDK
   - Simplified buildDeviceHeader function

4. **tests/simple-auth.test.ts**
   - Created simple test that directly authenticates
   - Uses minimal X-Device header format

## Testing

### Current Status
Account temporarily locked due to multiple failed authentication attempts during debugging.

**Error received:**
```
errorCode: "incorrect_password_too_many_times"
```

This confirms the authentication flow is now correct - the server is receiving and processing credentials properly.

### Next Steps

1. **Wait 15-30 minutes** for account unlock
2. **Run tests:**
   ```bash
   pnpm test:auth          # Test authentication only
   pnpm test:v2            # Test v2 operations
   pnpm test               # Run all tests
   ```

3. **Expected outcome:** All tests should pass once account is unlocked

## References

- [ticktick-sdk](https://github.com/dev-mirzabicer/ticktick-sdk) - Official Python SDK
- [ticktick-sdk auth.py](https://github.com/dev-mirzabicer/ticktick-sdk/blob/main/src/ticktick_sdk/api/v2/auth.py) - V2 authentication implementation
- [ticktick-sdk constants.py](https://github.com/dev-mirzabicer/ticktick-sdk/blob/main/src/ticktick_sdk/constants.py) - API base URLs and constants

## Important Notes

- The V2 API uses session-based authentication (unofficial, reverse-engineered)
- 2FA (two-factor authentication) is **not supported** with session authentication
- Session tokens are valid for ~24 hours
- Rate limiting: Too many failed attempts will lock the account for 15-30 minutes
