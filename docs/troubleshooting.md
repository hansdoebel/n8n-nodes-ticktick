# Troubleshooting

## Known Issues

### V1 API (Official)

**Inbox Handling**
- The "Default Inbox" is handled internally as the "inbox" ID
- It supports fetching tasks but does not support "Get Specific Project" details
- The inbox is not a standard project in TickTick's API

**Empty Responses**
- Operations like delete or complete often return `200 OK` with no body
- This node generates a success message for these cases

### V2 API (Undocumented)

**Undocumented API**
- The V2 Session API is not officially documented by TickTick
- Endpoints were discovered through reverse engineering
- API may change without notice
- Use at your own risk

**Authentication**
- Session API requires email/password credentials
- Credentials are stored securely by n8n
- Consider security implications for your use case
- 2FA is not supported for Session API authentication

### General

**Unofficial Node**
- This is a community-maintained node
- Not affiliated with or endorsed by TickTick or n8n

## FAQ

**Q: Which credential type should I use?**

A: Use Session API (V2) if you need tags, habits, focus tracking, or sync features. Use API Token (V1) for simpler setups that only need basic task/project operations.

**Q: Why can't I see V2 operations?**

A: V2 operations require Session API credentials. If you're using API Token or OAuth2, only V1 operations are available.

**Q: Why does "Get Specific Project" fail for my inbox?**

A: The inbox is a special container in TickTick, not a standard project. Use "Get All Projects" or "Get Project With Tasks" instead.

**Q: My session keeps expiring. What's wrong?**

A: Session tokens are valid for ~24 hours. The node automatically refreshes sessions, but if you're experiencing issues, try re-saving your credentials.

**Q: Can I use 2FA with the Session API?**

A: No, 2FA is not supported. You'll need to disable 2FA on your TickTick account to use Session API authentication.
