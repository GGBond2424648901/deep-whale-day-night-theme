# Deep Whale rc.7 Install, Performance, and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Deep Whale v0.1.11 as an official-profile-compatible, lightweight, lower-GPU day/night theme for DeepSeek Harness rc.7.

**Architecture:** Replace the unavailable Theme Plugins/catalog integration with one standalone profile-bundle row whose browser half injects only the official `theme` service. Add a small motion controller that selects balanced or reduced CSS behavior, then stage an allowlisted runtime package for GitHub and `.tgz` installation while the source branch remains complete.

**Tech Stack:** TypeScript, Cordis, DeepSeek Harness profile bundles, DOM/CSS, Vitest/jsdom, Node.js packaging scripts, pnpm, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-08-19-rc7-install-performance-release-design.md`

## Global Constraints

- Target official `@deepseek-ai/dsh@0.1.0-rc.7`; retain rc.5/rc.6 compatibility where the profile-bundle and `theme` service interfaces match.
- Keep package name `@dsh-external/dsh-client-ui-skin-deep-whale-day-night` and Loader id `ui-skin-deep-whale-day-night` unique.
- Do not depend on `themePlugins`, `themeCatalog`, `@deepseek-ai/dsh-client-ui-theme-plugins`, or `@deepseek-ai/dsh-host-theme-catalog`.
- Runtime GitHub channel must contain at most 15 MiB of tracked blobs.
- Balanced mode creates at most ten atmosphere particles; reduced and hidden modes run no theme-owned infinite animations.
- Preserve CC-BY-NC-SA-4.0, bilingual non-commercial notices, attribution, screenshots, and approved day/night artwork.
- Do not modify the parent repository's dirty `tsconfig.host.json` or the existing untracked concept-source assets.
- npm publication is excluded until package-name ownership and npm authentication are available.

## File Map

- `package.json`: official client dependency graph, runtime allowlist, v0.1.11 metadata, release scripts.
- `cordis.patch.yml`: one direct profile-bundle insertion using the unique Loader id.
- `src/index.ts`: no-op host half required by the bundle row.
- `src/client/index.ts`: DOM activation, official theme toggle, motion-controller integration.
- `src/client/motion.ts`: pure motion-mode resolution plus visibility/WebGL lifecycle.
- `src/client/maid-atelier.module.css`: balanced/reduced animation and filter budgets.
- `src/manifest.ts`: removed because official Harness has no host theme catalog.
- `skin.json`: canonical id, version, wiring id, preview metadata.
- `scripts/build-runtime-package.mjs`: deterministic runtime staging, size gate, tarball, checksum.
- `scripts/verify-harness-install.mjs`: isolated rc.7 install/dump/remove verifier.
- `tests/apply.spec.ts`: activation, disposal, official injection, particle and visibility behavior.
- `tests/motion.spec.ts`: pure motion decisions and controller lifecycle.
- `tests/distribution.spec.ts`: manifest, patch, runtime allowlist, version, attribution.
- `tests/runtime-package.spec.ts`: staged payload and size checks.
- `tests/harness-install.spec.ts`: config-dump diagnostic parser tests.
- `README.md`, `CHANGELOG.md`: bilingual install, migration, performance, and release documentation.
- `.gitignore`: generated `dist/` release artifacts.

---

### Task 1: Restore the official standalone plugin lifecycle

**Files:**
- Modify: `tests/apply.spec.ts`
- Modify: `tests/distribution.spec.ts`
- Modify: `package.json`
- Modify: `cordis.patch.yml`
- Modify: `src/index.ts`
- Modify: `src/client/index.ts`
- Delete: `src/manifest.ts`
- Modify: `skin.json`

**Interfaces:**
- Consumes: official Cordis `Context`, official browser `ctx.theme.setTheme('light' | 'dark')`.
- Produces: `export const inject = ['theme']`, `export function apply(ctx: Context): void`, direct profile row `ui-skin-deep-whale-day-night`.

- [ ] **Step 1: Replace the obsolete manifest and inert-adapter assertions with official lifecycle assertions**

Add these expectations to the existing manifest test in `tests/apply.spec.ts`:

```ts
expect(manifest.dsh.client).toEqual({
  inject: ['@deepseek-ai/dsh-client-ui-theme'],
  platform: 'web',
})
expect((skin as { inject?: string[] }).inject).toEqual(['theme'])
expect(JSON.stringify(manifest)).not.toMatch(/themePlugins|themeCatalog|theme-plugins|theme-catalog/)
```

Replace the adapter-registration test with direct activation:

```ts
it('activates directly through the official theme service', async () => {
  const ctx = new Context()
  ctx.provide('theme', { setTheme: vi.fn() } as never)
  const registered = ctx.plugin({ inject: skin.inject, apply: skin.apply })
  await registered.await()
  expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(true)
  await registered.dispose()
  expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(false)
})
```

Change the patch assertion in `tests/distribution.spec.ts` to:

```ts
expect(patch).toMatch(/^- insert:\s*\n\s*- id: ui-skin-deep-whale-day-night$/mu)
expect(patch).toContain("name: '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'")
expect(patch).not.toContain('ui-skin-maid-atelier')
```

- [ ] **Step 2: Run the focused tests and confirm the old integration fails**

Run: `pnpm vitest run --config vitest.config.ts tests/apply.spec.ts tests/distribution.spec.ts`

Expected: FAIL because the manifest still lists Theme Plugins, `skin.inject` still contains `themePlugins`, activation is inert, and the patch has no direct insert.

- [ ] **Step 3: Implement the official bundle and client lifecycle**

Set `dsh.client.inject` in `package.json` to only `@deepseek-ai/dsh-client-ui-theme`. Remove the two unavailable peer/dev dependencies. Keep `@deepseek-ai/cordis` and `@deepseek-ai/dsh-client-ui-theme` as optional peers so profile installation does not install duplicate platform singletons or report missing peers:

```json
"peerDependencies": {
  "@deepseek-ai/cordis": "^4.0.1",
  "@deepseek-ai/dsh-client-ui-theme": ">=0.1.0-rc.5 <0.2.0"
},
"peerDependenciesMeta": {
  "@deepseek-ai/cordis": { "optional": true },
  "@deepseek-ai/dsh-client-ui-theme": { "optional": true }
}
```

Replace `cordis.patch.yml` with the direct insert from the spec. Replace `src/index.ts` with:

```ts
/** Host half for the Deep Whale profile bundle; browser activation is declared by dsh.client. */
export function apply(): void {}
```

In `src/client/index.ts`, remove Theme Plugins types, the `themePlugins` context member, adapter registration, and adapter-related comments. Set:

```ts
export const inject = ['theme']

/** Activate the complete skin while this browser plugin fiber is mounted. */
export function apply(ctx: Context): void {
  ctx.effect(() => activateMaidAtelier(ctx), 'ui-skin-deep-whale-day-night: browser skin')
}
```

Delete `src/manifest.ts`. Set `skin.json` wiring to `{ "id": "ui-skin-deep-whale-day-night", "bundleWired": true }`.

- [ ] **Step 4: Run lifecycle, distribution, type, and bundle checks**

Run:

```powershell
pnpm vitest run --config vitest.config.ts tests/apply.spec.ts tests/distribution.spec.ts
pnpm run typecheck
pnpm run build
rg -n "themePlugins|themeCatalog|dsh-client-ui-theme-plugins|dsh-host-theme-catalog" package.json cordis.patch.yml src lib
```

Expected: tests, typecheck, and build PASS; `rg` returns no matches.

- [ ] **Step 5: Commit the standalone compatibility fix**

```powershell
git add package.json cordis.patch.yml src/index.ts src/client/index.ts src/manifest.ts skin.json tests/apply.spec.ts tests/distribution.spec.ts lib
git commit -m "fix(theme): restore official profile activation"
```

---

### Task 2: Add the balanced/reduced motion controller

**Files:**
- Create: `src/client/motion.ts`
- Create: `tests/motion.spec.ts`
- Modify: `src/client/index.ts`
- Modify: `src/client/maid-atelier.module.css`
- Modify: `tests/apply.spec.ts`

**Interfaces:**
- Consumes: `Document.hidden`, `Window.matchMedia('(prefers-reduced-motion: reduce)')`, WebGL context creation.
- Produces: `MaidMotionMode`, `MotionSignals`, `BALANCED_PARTICLE_LIMIT`, `resolveMotionMode(signals)`, `detectAcceleratedWebGL(documentRef)`, `installMotionController(body, documentRef, windowRef)`.

- [ ] **Step 1: Write pure decision and lifecycle tests**

Create `tests/motion.spec.ts` with jsdom and these cases:

```ts
expect(resolveMotionMode({ hidden: false, prefersReducedMotion: false, acceleratedWebGL: true }))
  .toBe('balanced')
expect(resolveMotionMode({ hidden: true, prefersReducedMotion: false, acceleratedWebGL: true }))
  .toBe('reduced')
expect(resolveMotionMode({ hidden: false, prefersReducedMotion: true, acceleratedWebGL: true }))
  .toBe('reduced')
expect(resolveMotionMode({ hidden: false, prefersReducedMotion: false, acceleratedWebGL: false }))
  .toBe('reduced')
expect(BALANCED_PARTICLE_LIMIT).toBe(10)
```

Add a controller test that stubs `document.hidden`, `matchMedia`, and canvas `getContext`, dispatches `visibilitychange`, checks `body.dataset.maidMotion`, disposes, and verifies the original attribute and listener behavior are restored.

In `tests/apply.spec.ts`, assert the mounted atmosphere has at most ten child elements and disposal removes `data-maid-motion`.

- [ ] **Step 2: Run the new tests and confirm missing exports fail**

Run: `pnpm vitest run --config vitest.config.ts tests/motion.spec.ts tests/apply.spec.ts`

Expected: FAIL because `src/client/motion.ts` and the motion dataset do not exist and atmosphere still has 24 elements.

- [ ] **Step 3: Implement the motion controller**

Create `src/client/motion.ts` with:

```ts
export type MaidMotionMode = 'balanced' | 'reduced'

export interface MotionSignals {
  hidden: boolean
  prefersReducedMotion: boolean
  acceleratedWebGL: boolean
}

export const BALANCED_PARTICLE_LIMIT = 10

export function resolveMotionMode(signals: MotionSignals): MaidMotionMode {
  return signals.hidden || signals.prefersReducedMotion || !signals.acceleratedWebGL
    ? 'reduced'
    : 'balanced'
}
```

`detectAcceleratedWebGL(documentRef)` creates one canvas and calls `getContext('webgl', { failIfMajorPerformanceCaveat: true })`, then `webgl2`; it catches context failures and returns false. `installMotionController` records the original `data-maid-motion`, samples the stable reduced-motion/WebGL preference, forces reduced while hidden, listens to `visibilitychange`, and returns a disposer that removes the listener and restores the original attribute exactly.

- [ ] **Step 4: Integrate the ten-particle cap and controller lifecycle**

Import `BALANCED_PARTICLE_LIMIT` and `installMotionController` in `src/client/index.ts`. Change the atmosphere loop to:

```ts
for (const [index, profile] of ATMOSPHERE_PARTICLES
  .slice(0, BALANCED_PARTICLE_LIMIT)
  .entries()) {
```

Mount the controller before creating skin chrome and call its disposer during skin teardown. The effect disposer must still be idempotent.

- [ ] **Step 5: Apply the CSS compositor budget**

In `src/client/maid-atelier.module.css`:

- remove permanent `will-change` declarations from trim and atmosphere rules;
- remove infinite animation from full-screen day caustics/glow and night halo/star-field layers;
- change `maidAtelierSessionJewelChase` from infinite to three iterations;
- keep transform/opacity particle animation only under `body[data-maid-motion='balanced']`;
- add one reduced rule that sets theme-owned `animation: none !important` and `transition-duration: 0.01ms !important`;
- set large composer/message backdrop filters to `none` under reduced mode while retaining their semitransparent backgrounds;
- retain finite composer and theme-switch transitions only under their existing transition data attributes.

- [ ] **Step 6: Run motion, lifecycle, and CSS contract tests**

Run:

```powershell
pnpm vitest run --config vitest.config.ts tests/motion.spec.ts tests/apply.spec.ts
pnpm run typecheck
pnpm run build
```

Expected: PASS. `rg -n "deepWhaleDayCaustics.*infinite|deepWhaleMoonHalo.*infinite|will-change: transform, opacity" src/client/maid-atelier.module.css` returns no full-screen/permanent-animation matches.

- [ ] **Step 7: Commit the performance controller**

```powershell
git add src/client/motion.ts src/client/index.ts src/client/maid-atelier.module.css tests/motion.spec.ts tests/apply.spec.ts lib
git commit -m "perf(theme): bound idle animation work"
```

---

### Task 3: Build and gate the lightweight runtime package

**Files:**
- Create: `scripts/build-runtime-package.mjs`
- Create: `tests/runtime-package.spec.ts`
- Modify: `tests/distribution.spec.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: built `lib/index.js`, `lib/client.js`, package metadata, previews, license files.
- Produces: `RUNTIME_FILES`, `MAX_RUNTIME_BYTES`, `stageRuntimePackage(root, output)`, `dist/runtime-package/`, versioned `.tgz`, `.sha256`.

- [ ] **Step 1: Write failing runtime allowlist and size tests**

Create `tests/runtime-package.spec.ts` that imports the packaging module and asserts:

```ts
expect(RUNTIME_FILES).toEqual([
  'package.json', 'cordis.patch.yml', 'lib/index.js', 'lib/client.js',
  'skin.json', 'preview/light.webp', 'preview/dark.webp',
  'README.md', 'CHANGELOG.md', 'LICENSE', 'NOTICE',
])
expect(MAX_RUNTIME_BYTES).toBe(15 * 1024 * 1024)
```

Stage into a test temporary directory, assert every allowlisted file exists, assert `src`, `tests`, `assets`, `screenshots`, and `lib/client.js.map` do not exist, and assert the returned total is at most `MAX_RUNTIME_BYTES`.

Update the distribution test to require `package.json.files` to match the same runtime allowlist and `private` not to be true.

- [ ] **Step 2: Run packaging tests and confirm the missing script/old allowlist fail**

Run: `pnpm vitest run --config vitest.config.ts tests/runtime-package.spec.ts tests/distribution.spec.ts`

Expected: FAIL because the packaging module does not exist and `files` still includes `src` and `tests`.

- [ ] **Step 3: Implement deterministic staging, tarball, and checksum**

Create `scripts/build-runtime-package.mjs` using `node:fs/promises`, `node:path`, `node:crypto`, and `node:child_process`. Export the exact allowlist and byte limit. `stageRuntimePackage` must delete only its explicit output directory, recreate parents, copy each allowlisted file, sum regular-file sizes, and throw:

```js
throw new Error(`Runtime package is ${total} bytes; limit is ${MAX_RUNTIME_BYTES}`)
```

The CLI path stages `dist/runtime-package`, runs `pnpm pack --pack-destination ../release` from that directory, writes `<tarball>.sha256` with lowercase hex plus the filename, and prints a JSON summary containing `stage`, `tarball`, `sha256`, and `bytes`.

- [ ] **Step 4: Make the source package packable without duplicate runtime files**

Remove `private: true` from `package.json`. Replace `files` with the exact runtime allowlist. Add:

```json
"pack:runtime": "node scripts/build-runtime-package.mjs"
```

Add `dist/` to `.gitignore`. Do not add a `prepare` script; GitHub runtime installs consume committed `lib` artifacts and must not require pnpm build approval.

- [ ] **Step 5: Run packaging tests and build a real tarball**

Run:

```powershell
pnpm run build
pnpm vitest run --config vitest.config.ts tests/runtime-package.spec.ts tests/distribution.spec.ts
pnpm run pack:runtime
Get-ChildItem dist\release | Select-Object Name,Length
```

Expected: PASS; the staged files total at most 15 MiB; `.tgz` and `.sha256` exist; the tarball contains neither `src/` nor source maps.

- [ ] **Step 6: Commit runtime packaging**

```powershell
git add package.json .gitignore scripts/build-runtime-package.mjs tests/runtime-package.spec.ts tests/distribution.spec.ts
git commit -m "build(theme): add lightweight runtime package"
```

---

### Task 4: Automate official Harness installation verification

**Files:**
- Create: `scripts/verify-harness-install.mjs`
- Create: `tests/harness-install.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: a pnpm package spec passed as `--package`, official DSH version passed as `--dsh-version`.
- Produces: `assertCompatibleDump(stdout, stderr)`, an isolated temporary `DSH_HOME`, and a JSON verification summary.

- [ ] **Step 1: Write diagnostic-parser tests**

Create `tests/harness-install.spec.ts` and assert that `assertCompatibleDump`:

```ts
expect(() => assertCompatibleDump(
  "- id: ui-skin-deep-whale-day-night\n  name: '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'\n",
  '',
)).not.toThrow()
expect(() => assertCompatibleDump('', 'patch: entry "ui-skin-maid-atelier" not found')).toThrow(/unmatched patch/i)
expect(() => assertCompatibleDump('', 'pending (waiting for service: themePlugins)')).toThrow(/legacy theme service/i)
expect(() => assertCompatibleDump('- id: ui-skin-deep-whale-day-night\n- id: ui-skin-deep-whale-day-night\n', '')).toThrow(/exactly once/i)
```

- [ ] **Step 2: Run the parser test and confirm the module is missing**

Run: `pnpm vitest run --config vitest.config.ts tests/harness-install.spec.ts`

Expected: FAIL because the verifier module does not exist.

- [ ] **Step 3: Implement the isolated rc.7 verifier**

Create `scripts/verify-harness-install.mjs`. Export `assertCompatibleDump(stdout, stderr)`. The CLI must:

1. parse `--package`, optional `--dsh-version` defaulting to `0.1.0-rc.7`, and optional `--keep-home`;
2. create a temporary home with `mkdtemp`;
3. run `pnpm dlx @deepseek-ai/dsh@<version> plugin --profile web add <spec>` with `DSH_HOME` set;
4. reject install stderr containing missing peer dependencies owned by this package;
5. run `--profile web --dump-config` and call `assertCompatibleDump`;
6. run `plugin --profile web remove @dsh-external/dsh-client-ui-skin-deep-whale-day-night`;
7. dump again and assert the row is absent;
8. remove the temporary home unless `--keep-home` is present;
9. print JSON containing the version, package spec, install status, row count, removal status, and retained home path when requested.

Use `pnpm.cmd` on Windows and `pnpm` elsewhere. Forward stdout/stderr only after redacting the temporary home prefix.

- [ ] **Step 4: Add the verification script and run local/tarball matrices**

Add:

```json
"verify:harness": "node scripts/verify-harness-install.mjs"
```

Run:

```powershell
pnpm vitest run --config vitest.config.ts tests/harness-install.spec.ts
pnpm run verify:harness -- --package "file:$((Resolve-Path .).Path)"
pnpm run verify:harness -- --package "$((Get-ChildItem dist/release/*.tgz | Select-Object -First 1).FullName)"
```

Expected: both install/dump/remove matrices PASS on rc.7 with one inserted row and no legacy-service or unmatched-patch diagnostics.

- [ ] **Step 5: Commit the installation verifier**

```powershell
git add package.json scripts/verify-harness-install.mjs tests/harness-install.spec.ts
git commit -m "test(theme): verify official Harness installs"
```

---

### Task 5: Publish v0.1.11 documentation and metadata

**Files:**
- Modify: `package.json`
- Modify: `skin.json`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Test: `tests/distribution.spec.ts`

**Interfaces:**
- Consumes: verified runtime branch name `runtime`, rc.7 install command, existing previews/screenshots.
- Produces: bilingual v0.1.11 install/migration/performance documentation and release metadata.

- [ ] **Step 1: Update metadata tests for v0.1.11 and public install copy**

In `tests/distribution.spec.ts`, require package and skin version `0.1.11`, the runtime GitHub command, local `.tgz` command, source-branch link, rc.7 compatibility statement, and bilingual non-commercial wording. Require README not to advertise Theme Plugins/catalog import.

- [ ] **Step 2: Run the distribution test and confirm old metadata fails**

Run: `pnpm vitest run --config vitest.config.ts tests/distribution.spec.ts`

Expected: FAIL because package/skin remain 0.1.10 and README describes the obsolete integration/install path.

- [ ] **Step 3: Write bilingual install and migration documentation**

Update `README.md` with these tested paths:

```powershell
dsh plugin --profile web add git+https://github.com/GGBond2424648901/deep-whale-day-night-theme.git#runtime
dsh plugin --profile web add .\deep-whale-day-night-theme-0.1.11.tgz
```

Document `dsh plugin --profile web update @dsh-external/dsh-client-ui-skin-deep-whale-day-night`, the pre-rename remove/install migration, `dsh --profile web --dump-config`, and removal. Explain source vs runtime channels, balanced/reduced motion behavior, rc.7 target, Desktop 2.0 profile compatibility, screenshots, attribution, and the non-commercial license in Chinese and English.

Prepend a v0.1.11 section to `CHANGELOG.md` covering official activation, runtime channel, rc.7 install matrix, and GPU/compositor changes. Set package and skin versions to `0.1.11`; keep the skin package name and change its wiring id only to the new unique id.

- [ ] **Step 4: Run the complete package verification**

Run:

```powershell
pnpm run test
pnpm run typecheck
pnpm run build
pnpm run pack:runtime
git diff --check
```

Expected: all commands PASS; runtime payload stays under 15 MiB.

- [ ] **Step 5: Commit release documentation**

```powershell
git add package.json skin.json README.md CHANGELOG.md tests/distribution.spec.ts lib
git commit -m "docs(theme): prepare v0.1.11 release"
```

---

### Task 6: Browser and performance acceptance on rc.7 and rc.5

**Files:**
- Modify only if verification finds a defect: `src/client/index.ts`, `src/client/motion.ts`, `src/client/maid-atelier.module.css`, corresponding tests.
- Record results in: GitHub release notes prepared during Task 7; do not commit machine-specific profiling files.

**Interfaces:**
- Consumes: verified local package/tarball, isolated rc.7 profile, existing rc.5 development workspace.
- Produces: browser evidence for activation, light/dark switching, sidebar responsiveness, teardown, and bounded animation counts.

- [ ] **Step 1: Run a final clean static/build matrix**

Run:

```powershell
pnpm run test
pnpm run typecheck
pnpm run build
pnpm run pack:runtime
pnpm run verify:harness -- --package "file:$((Resolve-Path .).Path)"
pnpm run verify:harness -- --package "$((Get-ChildItem dist/release/*.tgz | Select-Object -First 1).FullName)"
```

Expected: every command PASS from the release commit candidate.

- [ ] **Step 2: Boot official rc.7 from an isolated retained profile**

Run the verifier with `--keep-home`, then start official rc.7 on an unused port with that `DSH_HOME`:

```powershell
$env:DSH_HOME = '<retained-home>'
pnpm dlx @deepseek-ai/dsh@0.1.0-rc.7 --profile web --port 5184
```

Use a hidden background process and record its PID; terminate only that exact process after browser checks.

- [ ] **Step 3: Verify rc.7 in the in-app browser**

Open `http://127.0.0.1:5184/` and assert:

- no “Failed to load plugins” screen or pending fiber;
- `body[data-dsh-maid-atelier]` exists;
- the day scene, sidebar companion, glass surfaces, and composer ornament render;
- the theme toggle switches `data-ds-dark-theme` and scene artwork;
- expanded/collapsed sidebar content remains interactive;
- command menus and dialogs render above theme layers;
- balanced mode has at most ten `[data-maid-particle]` nodes;
- setting document visibility/reduced-motion through browser emulation leaves zero running theme-owned infinite animations;
- repeated theme switches do not increase theme-owned node counts.

- [ ] **Step 4: Verify the rc.5 development floor**

Build and run the existing rc.5 worktree Web surface with the updated local bundle, then repeat activation, day/night, session, and sidebar checks at `1280×720`, `2048×1152`, and browser zoom 100%/125%/150%.

Expected: the theme activates through the same `theme` service and remains usable at every tested viewport/zoom.

- [ ] **Step 5: Check Windows GPU behavior manually**

With an idle day view and idle night view, compare Task Manager GPU usage after 30 seconds against the v0.1.10 page. Record whether usage settles and confirm the browser inspector shows no more than ten particle animations and no full-screen infinite theme gradients. Treat the structural animation gates as acceptance; report the observed percentage as hardware-specific evidence, not a CI threshold.

- [ ] **Step 6: Fix any verified regression with a failing test first, then rerun only affected checks**

For each defect, add a focused assertion to `tests/apply.spec.ts`, `tests/motion.spec.ts`, or `tests/distribution.spec.ts`, observe it fail, implement the smallest fix, and rerun the focused test plus build. Commit each independent correction as `fix(theme): <verified behavior>`.

---

### Task 7: Publish source, runtime branch, release, registry update, and issue notices

**Files:**
- Sync verified tracked package files into: `D:/AI_Demo/DeepSeek-Harness-WhaleTheme-Migration-20260814-204146/github-release/deep-whale-day-night-theme`
- Generate runtime branch from: `dist/runtime-package`
- Publish release assets from: `dist/release`
- Modify external marketplace entry in its own fork/branch only if required.

**Interfaces:**
- Consumes: source commit, staged runtime package, `.tgz`, checksum, existing screenshots.
- Produces: source `main`, lightweight `runtime`, GitHub release `v0.1.11`, marketplace update/PR, issue evidence.

- [ ] **Step 1: Confirm publication scope and repository state**

Run:

```powershell
git status --short --branch
git log -8 --oneline
git -C D:\AI_Demo\DeepSeek-Harness-WhaleTheme-Migration-20260814-204146\github-release\deep-whale-day-night-theme fetch origin
git -C D:\AI_Demo\DeepSeek-Harness-WhaleTheme-Migration-20260814-204146\github-release\deep-whale-day-night-theme status --short --branch
gh auth status
```

Expected: implementation worktree contains only known user-owned untracked files; public clone is clean; GitHub account is `GGBond2424648901`.

- [ ] **Step 2: Sync and commit the complete source release on a publication branch**

Create/reset only `publish/v0.1.11` from `origin/main`. Mechanically copy the verified tracked theme package, excluding `.git`, `node_modules`, `dist`, parent `.superpowers/.tmp`, and the known untracked concept-source files. Inspect `git diff --stat`, `git diff --check`, version, manifest, and checksums before committing:

```powershell
git commit -m "release: prepare Deep Whale v0.1.11"
git push -u origin publish/v0.1.11
```

Merge or fast-forward this reviewed branch to `main`, then push `main` without force.

- [ ] **Step 3: Publish the lightweight runtime branch safely**

Use a separate Git worktree rooted at an explicit publication-only path. Check out or create `runtime`, remove only files inside that verified worktree, copy the exact `dist/runtime-package` allowlist, and commit:

```powershell
git commit -m "release: publish v0.1.11 runtime package"
git push origin runtime
```

Before push, sum tracked blobs and assert at most 15 MiB. Do not force if the remote runtime branch moved; fetch and reconcile first.

- [ ] **Step 4: Verify the public GitHub runtime installation**

Run:

```powershell
pnpm run verify:harness -- --package "git+https://github.com/GGBond2424648901/deep-whale-day-night-theme.git#runtime"
```

Then boot the retained clean profile and repeat the activation/body-attribute check. Expected: public GitHub installation passes with no build approval, unmatched patch, missing peer, or pending-service diagnostics.

- [ ] **Step 5: Create the bilingual GitHub release**

Create tag/release `v0.1.11` from the published source commit. Release notes must include:

- fixed local/GitHub activation on official rc.7;
- runtime branch and `.tgz` installation commands;
- measured source/runtime sizes;
- balanced/reduced GPU changes and hardware-specific caveat;
- update/removal/migration commands;
- CC-BY-NC-SA-4.0 non-commercial notice;
- day and night screenshots.

Attach the `.tgz`, `.sha256`, `screenshots/day.png`, and `screenshots/night.png`. Verify `gh release view v0.1.11` lists every asset and points to the intended source commit.

- [ ] **Step 6: Update the marketplace install reference**

Locate the existing Deep Whale entry in the public DSH marketplace, change its install spec to `git+https://github.com/GGBond2424648901/deep-whale-day-night-theme.git#runtime`, run the marketplace's documented validation, and either push directly when authorized or open a pull request. Link the merged change or PR in the release notes and issue #7.

- [ ] **Step 7: Respond to the four reported issues with evidence**

- #5: cite removal of unavailable Theme Plugins/catalog services and rc.7 browser activation; close after verification.
- #8: cite successful local, tarball, and public GitHub runtime matrices; close after verification.
- #7: cite source/runtime/tarball byte sizes and marketplace runtime reference; close after verification.
- #2: cite animation/compositor changes and measured Windows observation; request reporter retest and leave open if hardware confirmation is not available.

- [ ] **Step 8: Run final remote verification**

Verify source `main`, `runtime`, tag `v0.1.11`, release assets, install command, issue comments, and marketplace link through GitHub. Confirm the parent Harness main worktree and user-owned untracked assets were not changed. Record final source commit, runtime commit, release URL, artifact checksum, matrix commands, and results for the user handoff.
