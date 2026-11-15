# Development

## Project Structure

```
n8n-nodes-ticktick/
├── credentials/                    # Authentication credentials
│   ├── TickTickOAuth2Api.credentials.ts
│   ├── TickTickSessionApi.credentials.ts
│   └── TickTickTokenApi.credentials.ts
├── nodes/TickTick/                 # Main node implementation
│   ├── TickTick.node.ts            # Action node
│   ├── TickTickTrigger.node.ts     # Poll trigger (not an AI tool)
│   ├── helpers/                    # API, session, and path helpers
│   └── resources/                  # Resource implementations
├── tests/unit/                     # Unit tests
├── tests/integration/              # Live TickTick tests
└── dist/                           # Build output
```

## Commands

Requires Bun 1.4 or newer (lockfile version 2).

```bash
bun install            # Install from bun.lock
bun run build          # Build with the n8n node CLI
bun run dev            # Development mode
bun run lint           # ESLint check
bun run lint:fix       # ESLint auto-fix
bun test tests/unit    # Unit tests
bun test tests/integration  # Live API tests (needs .env)
bun test               # All tests
```

## Adding a New Resource

1. Create folder: `nodes/TickTick/resources/<resourceName>/`
2. Create `<Resource>Description.ts` with resource and operation definitions
3. Create `operations/` folder with one file per operation
4. Create `operations/index.ts` barrel export
5. Create `methods.ts` for load options (if needed)
6. Create `index.ts` barrel export
7. Register in `resources/index.ts`
8. Add to `TickTick.node.ts` description and execute method

## Adding a New Operation

1. Create `<Resource><Operation>.ts` in `operations/` folder
2. Export the operation definition (`INodeProperties[]`)
3. Export the execute function
4. Add to `operations/index.ts`
5. Add operation to `<Resource>Description.ts`
6. Add execute case in `TickTick.node.ts`

## Code Patterns

### Resource Registry

Each resource has its own folder with:
- Description file (resource + operations)
- Operations folder (one file per operation)
- Methods file (load options)
- Index barrel export

### Load Options

Dynamic dropdowns use `loadOptions` methods:
```typescript
// Return INodePropertyOptions[] with name and value
// Call the API with this.helpers.httpRequest (or httpRequestWithAuthentication for V1)
// Register in TickTick.node.ts under methods.loadOptions
```

### V1 vs V2 API

- **V1**: Uses `/open/v1/` endpoints, works with Token or OAuth2
- **V2**: Uses `/api/v2/` endpoints, requires Session API
- Check credential type with `this.getNodeParameter('authentication')`

## Runtime dependencies

`luxon` is imported by the node and listed in `devDependencies`. n8n provides `luxon` at runtime (`n8n-workflow` depends on it as well), so the published package does not ship its own copy. Leave the import in place; do not add a second `luxon` dependency.

## Publishing

Publishing is the tag workflow in `.github/workflows/publish.yml`. Pushing a tag that matches `v*` on `main` runs it. Creating a GitHub Release does not. The workflow builds and tests in one job, then a second job publishes the packed tarball with npm trusted publishing (GitHub OIDC). It does not use an `NPM_TOKEN`.

Bump `package.json` in a pull request. After that pull request is merged, the tag is pushed from `main`. Do not publish from a laptop with `npm publish`, and do not create the tag before the version bump is on `main`.
