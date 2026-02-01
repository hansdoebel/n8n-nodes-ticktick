# Development

## Project Structure

```
n8n-nodes-ticktick/
├── credentials/                    # Authentication credentials
│   ├── TickTickOAuth2Api.credentials.ts
│   ├── TickTickSessionApi.credentials.ts
│   └── TickTickTokenApi.credentials.ts
├── nodes/TickTick/                 # Main node implementation
│   ├── TickTick.node.ts            # Node entry point
│   ├── constants/                  # API constants
│   ├── helpers/                    # Utility functions
│   ├── resources/                  # Resource implementations
│   └── types/                      # TypeScript types
├── tests/                          # Test suite
└── dist/                           # Build output
```

## Commands

```bash
bun run build      # Build with tsc + tsc-alias + icons
bun run dev        # Development mode
bun run lint       # ESLint check
bun run lintfix    # ESLint auto-fix
bun test           # Run all tests
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
// Use this.helpers.requestWithAuthentication() for API calls
// Register in TickTick.node.ts under methods.loadOptions
```

### V1 vs V2 API

- **V1**: Uses `/open/v1/` endpoints, works with Token or OAuth2
- **V2**: Uses `/api/v2/` endpoints, requires Session API
- Check credential type with `this.getNodeParameter('authentication')`

## Publishing

```bash
npm version patch   # 2.1.1 -> 2.1.2
npm version minor   # 2.1.1 -> 2.2.0
npm version major   # 2.1.1 -> 3.0.0

git push origin v2.1.2  # Triggers publish workflow
```
