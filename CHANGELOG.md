# Changelog

## 2.3.0

Security and privacy fixes since 2.2.3, plus the publish-workflow dependency bumps that landed with them. Node operations, parameters, and credential fields are unchanged.

### Privacy

- V2 sign-on failures no longer include the TickTick email or the password. TickTick's `username_password_not_match` response puts the account email in `errorMessage`; that value is removed from the node error and from the session credential test. The error code and HTTP status are kept. ([PER-99](https://linear.app/zaf-joss-moom-thoy-yous/issue/PER-99))

### Session and credential hardening

Merged in [#30](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/30) (PER-91, PER-92, PER-93, PER-94, PER-95, PER-98):

- The in-memory V2 session cache is keyed by a hash of the normalized email and the password. A successful session lasts about 23 hours. Changing the password signs on again, and an old password cannot reuse the new session.
- Failed sign-ons are cached. Rejected credentials (HTTP 401 or 403, or an error code that mentions the password, including `username_password_not_match`) are not retried for 10 minutes. Network errors and other server failures are not retried for 30 seconds. Concurrent calls for the same email and password share one in-flight sign-on.
- Sign-on failures throw a `NodeApiError` that does not carry the request body, so the password is not attached to the error.
- Project ids that are interpolated into a URL go through `validatePathParam`.
- The session credential test calls `this.helpers.httpRequest` with a 15 second timeout.
- OAuth2 credentials request `tasks:read tasks:write`. The API-token credential test calls `https://api.ticktick.com` instead of the website host.

### Supply chain and dependencies

Merged in [#29](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/29) (PER-96, PER-97):

- The publish workflow pins third-party actions to commit SHAs, installs with `bun install --frozen-lockfile`, packs the tarball in the build job, and grants the npm OIDC token only to the publish job.
- Dev dependencies are updated, including `@n8n/node-cli` 0.56.4.
- The TickTick Trigger node is no longer offered as an AI tool (`usableAsTool` was removed so the current community-node lint rule passes). The TickTick action node is still usable as a tool.

### Publish workflow action bumps

- [#32](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/32) bumps `actions/checkout` from 4.4.0 to 7.0.1.
- [#31](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/31) bumps `actions/setup-node` from 4.4.0 to 7.1.0.

Both stay pinned to a commit SHA. The workflow still starts on a pushed tag matching `v*`, not on a GitHub Release.

### Docs

- [#33](https://github.com/hansdoebel/n8n-nodes-ticktick/pull/33) adds the Greptile badge to the README.
- README and `docs/` describe the V2 session cache, the failed-login backoff, the omission of secrets from errors, the OAuth scopes, and the trigger no longer being an AI tool.
