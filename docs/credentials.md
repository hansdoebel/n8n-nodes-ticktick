# Credentials

This node supports three authentication methods. Choose based on your needs.

## Comparison

| Feature | Session API (V2) | API Token (V1) | OAuth2 (V1) |
|---------|------------------|----------------|-------------|
| V1 Operations | Yes | Yes | Yes |
| V2 Operations | Yes | No | No |
| Setup Complexity | Low | Low | Medium |
| Requires App Registration | No | No | Yes |
| Tags, Habits, Focus | Yes | No | No |
| Sync All Data | Yes | No | No |

## TickTick Session API (V2)

For access to all features including V2 API operations.

**Setup:**
1. In n8n: Create new credential > **TickTick Session API**
2. Enter your TickTick **email** and **password**
3. Save

**Notes:**
- Provides access to the undocumented V2 API
- Also supports all V1 operations
- Session tokens are managed automatically

## TickTick API Token (V1)

Simple token-based authentication for V1 API only.

**Setup:**
1. In TickTick: Account Settings > API Token > "Manage"
2. Copy the token
3. In n8n: Create new credential > **TickTick API Token**
4. Paste the token and save

## TickTick OAuth2 (V1)

Standard OAuth2 flow for V1 API.

**Setup:**
1. Visit [TickTick Developer](https://developer.ticktick.com/)
2. Go to Manage Apps > New App
3. Copy **Client ID** and **Client Secret**
4. In n8n: Create new credential > **TickTick OAuth2 API**
5. Paste credentials and click **Connect**
6. Authorize in the popup window
