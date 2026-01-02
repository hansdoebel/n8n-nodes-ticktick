# Browser Network Debugging Guide

## Goal
Capture the actual authentication API call that happens when you log into TickTick.

## Steps

### 1. Open TickTick in Incognito/Private Mode
- This ensures you're logged out
- Chrome: `Cmd+Shift+N` (Mac) or `Ctrl+Shift+N` (Windows)
- Firefox: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)

### 2. Open Developer Tools
- Press `F12` or right-click → "Inspect"
- Go to the **Network** tab

### 3. Enable Important Filters
- ✅ Check "Preserve log" (so requests don't disappear)
- Filter by `XHR` or `Fetch` to see only API calls
- Or filter by `signon` in the search box

### 4. Navigate to TickTick
- Go to https://ticktick.com
- Click "Sign In" button

### 5. Clear Network Log
- Click the 🚫 clear button in Network tab
- This removes all previous requests

### 6. Submit Login Form
- Enter your email and password
- **BEFORE clicking Sign In**, make sure Network tab is recording
- Click "Sign In"

### 7. Find the Authentication Request
Look for a request that matches one of these patterns:

**Most likely:**
```
POST https://ticktick.com/api/v2/user/signon?wc=true&remember=true
```

**Or possibly:**
```
POST https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true
```

**Or maybe:**
```
POST https://ticktick.com/api/v2/user/login
POST https://ticktick.com/signin
```

### 8. Inspect the Request

Click on the authentication request and check these tabs:

#### A. **General Tab**
- Request URL: (full URL - COPY THIS)
- Request Method: (should be POST)
- Status Code: (should be 200)

#### B. **Headers Tab**
Look for these request headers:
- `User-Agent`: (what browser string?)
- `X-Device`: (JSON object with device info)
- `Content-Type`: (should be application/json)
- `Cookie`: (any cookies sent?)
- `Authorization`: (is there one?)
- `Origin`: (what domain?)
- `Referer`: (what page?)

#### C. **Payload/Request Tab**
- View the request body (should contain username/password)
- Format: JSON or Form Data?
- Example:
  ```json
  {
    "username": "user@example.com",
    "password": "password"
  }
  ```

#### D. **Response Tab**
Look at the response body:
- Does it contain `token`?
- Does it contain `inboxId`, `userId`?
- Example:
  ```json
  {
    "token": "some-long-token-string",
    "userId": "123456",
    "username": "user@example.com",
    "inboxId": "inbox123456"
  }
  ```

#### E. **Cookies Tab**
- Are any cookies set in the response?
- Look for a cookie named `t` (session token)

## What to Share

Copy and paste these details:

```
1. Request URL:
   [paste the full URL here]

2. Request Method:
   [GET or POST]

3. Request Headers (important ones):
   User-Agent: [value]
   X-Device: [value]
   Content-Type: [value]
   Cookie: [if any]
   Authorization: [if any]

4. Request Body:
   [paste the JSON or form data]

5. Response Status:
   [200, 401, etc.]

6. Response Body (first 200 chars):
   [paste snippet - remove your actual token if present]

7. Response Cookies:
   [list any cookies set, especially "t"]
```

## Alternative: Export as HAR

If the above is too much, you can:
1. Right-click in Network tab → "Save all as HAR with content"
2. Open the .har file in a text editor
3. Search for "signon" or "login"
4. Share the relevant section (remove sensitive data like actual tokens/passwords)

## Privacy Note

**IMPORTANT**: Before sharing, replace:
- Your actual password with `[PASSWORD]`
- Your actual email with `user@example.com`
- Any actual session tokens with `[TOKEN]`
- Your actual user IDs with `[USER_ID]`

We only need the structure and field names, not your real credentials!
