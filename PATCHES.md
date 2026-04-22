# Local dependency patches

This repo uses **`bun patch`** to keep small modifications to packages in `node_modules`. Patches live in `patches/` and are re-applied automatically on every `bun install` because `package.json` lists them under `patchedDependencies`.

## Active patches

### `@n8n/node-cli@0.23.1` → pin dev server to `n8n@2.18.1`

**Why:** `bun run dev` invokes `n8n-node dev`, which internally runs `npx n8n@latest`. The npm `latest` tag currently points to `n8n@2.17.5`, which ships a broken module registry (looks for `dist/modules/breaking-changes.ee/breaking-changes.module`, but the folder on disk is `dist/modules/breaking-changes/`). Result: `bun run dev` dies with `Failed to load module "breaking-changes"`.

**Fix:** patch `node_modules/@n8n/node-cli/dist/commands/dev/index.js` so the spawned command is `npx n8n@2.18.1` instead of `npx n8n@latest`.

**When to remove:** once the n8n `latest` dist-tag moves past 2.17.5 (check with `npm view n8n dist-tags`). At that point upstream is fine again — drop this patch unless you want to stay pinned.

## How to add a new patch

```bash
bun patch <package-name>           # makes node_modules/<pkg> editable
# …edit files under node_modules/<pkg>…
bun patch --commit 'node_modules/<package-name>'
```

`bun patch --commit` writes the diff to `patches/<pkg>.patch` and adds the entry to `package.json` → `patchedDependencies`. Commit both the patch file and the updated `package.json` / `bun.lock`.

## How to edit an existing patch

```bash
bun patch <package-name>           # re-extracts the pristine package for editing
# …edit files again…
bun patch --commit 'node_modules/<package-name>'
```

## How to revert a patch

1. Delete the `.patch` file in `patches/`.
2. Remove its entry from `patchedDependencies` in `package.json` (if it was the last patch, delete the whole key).
3. `bun install` — `node_modules` is restored to the upstream version.

To revert **all** patches in one go:

```bash
rm -rf patches/
# remove the "patchedDependencies" block from package.json
bun install
```

## Sanity check the patch is active

```bash
grep "n8n@2.18.1" node_modules/@n8n/node-cli/dist/commands/dev/index.js
```

Should print the patched line. If it prints `n8n@latest` instead, the patch didn't apply — re-run `bun install`.
