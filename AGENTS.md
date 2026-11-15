# AGENTS.md

Notes for coding agents working in this repository.

## Layout

- `credentials/` — `TickTickOAuth2Api`, `TickTickTokenApi`, and `TickTickSessionApi`.
- `nodes/TickTick/TickTick.node.ts` — action node. It is usable as an AI tool.
- `nodes/TickTick/TickTickTrigger.node.ts` — poll trigger. It is not usable as an AI tool.
- `nodes/TickTick/helpers/` — `apiRequest.ts`, `sessionManager.ts` (V2 sign-on and the in-memory session cache), `credentialTest.ts`, `constants.ts` (`ENDPOINTS`, `TICKTICK_URLS`), and `utils.ts` (`validatePathParam`).
- `nodes/TickTick/resources/` — one folder per resource, with operation files under `operations/`.
- `tests/unit/` — unit tests. `tests/integration/` — live TickTick API tests.
- `.github/workflows/publish.yml` — tag-triggered npm publish.

## Commands

Use Bun 1.4 or newer. `bun.lock` is lockfile version 2. Install with a frozen lockfile:

```bash
bun install --frozen-lockfile
bun run lint
bun run lint:fix
bun run build
bun test tests/unit
bun test tests/integration
bun test
```

`bun run lint` must report 0 errors before a change is done. `bun run build` and `bun test tests/unit` must pass. Do not treat a failing integration run as a code failure when `.env` is absent.

## Integration tests

Copy `.env.example` to `.env` and set:

- `TICKTICK_USERNAME` — TickTick account email
- `TICKTICK_PASSWORD` — TickTick account password

The account cannot have 2FA enabled.

Do not run repeated sign-on attempts with a wrong password against a real account. TickTick locks the account after too many failures (`incorrect_password_too_many_times`), and that lock lasts longer than the node's own backoff. One wrong password is already too many if you are about to try again. Integration tests must use the real password. The node caches a rejected sign-on for 10 minutes and a transient sign-on failure for 30 seconds, but a direct `fetch` in a test or a script still hits TickTick.

## Security

- Never put a password, a session token, or the account email in an error message, error description, credential-test result, or log line. TickTick's `username_password_not_match` response puts the email in `errorMessage`; scrub that before it is shown. Keep TickTick's `errorCode` and the HTTP status.
- Build URL paths with the `ENDPOINTS` helpers. They call `validatePathParam`. Do not concatenate a project id, task id, or date into a path yourself.
- Send HTTP from node code with `this.helpers.httpRequest` or `this.helpers.httpRequestWithAuthentication`. Do not call `this.helpers.request`. The session credential test uses `httpRequest` and falls back to `fetch` only when that helper is missing.

## Release

Agents must not publish, create a git tag, or open a GitHub Release unless the owner asks. Bump `package.json` in the pull request and stop there. The tag is pushed after merge.

`.github/workflows/publish.yml` is the only publish path:

- It runs on a push of a tag that matches `v*` (`on.push.tags`). It does not run on a GitHub `release` event.
- The build job checks out with `actions/checkout` 7.0.1, refuses a tag that is not on `main`, installs with `oven-sh/setup-bun` 2.2.0 and `actions/setup-node` 7.1.0 (Node 22), then runs `bun install --frozen-lockfile`, `bun run build`, `bun run lint`, and `bun test tests/unit`. It packs with `npm pack --ignore-scripts` and uploads that tarball. Third-party actions are pinned to commit SHAs. This job's token cannot publish.
- The publish job needs the build job. It has `id-token: write` and no GitHub environment, so the OIDC subject stays `repo:owner/repo:ref:refs/tags/vX`. npm trusted publishing uses that token. There is no `NPM_TOKEN`. The job installs npm 11.5.1 and runs `npm publish --access public` on the tarball from the build job. npm attaches provenance for this public repository. The publish job does not install the dev toolchain or run the package lifecycle scripts.

After merge, the owner cuts the release by pushing a `v*` tag that points at the merge commit on `main`.
