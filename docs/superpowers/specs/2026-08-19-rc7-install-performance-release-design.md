# Deep Whale rc.7 Compatibility, Lightweight Distribution, and Performance Design

## Status

Approved direction: Scheme A. This specification defines the v0.1.11 compatibility and release work for the Deep Whale Day & Night theme.

## Context

The current v0.1.10 distribution has four related failures:

1. Its profile patch targets `ui-skin-maid-atelier`, a row that official DeepSeek Harness does not compose. Harness rc.7 therefore reports that the entry was not found and never adds the theme.
2. The package introduced dependencies on `themePlugins` and `themeCatalog` in v0.1.7. Neither service nor either referenced package exists in official Harness rc.7, so a row that is forced into the tree remains pending or fails to import.
3. The default GitHub branch contains 63,945,770 bytes of tracked blobs. GitHub installation downloads the complete branch archive, including design sources, duplicate generated sources, source maps, and runtime bundles.
4. The active skin runs 24 particle elements, multiple full-viewport infinite animations, permanent `will-change` layers, and several large backdrop filters. This keeps the compositor active even while the interface is idle.

Official Harness rc.7 installs external Web plugins as profile bundles. A bundle contributes a `cordis.patch.yml` layer, and a browser plugin declares `dsh.client` metadata. The official theme plugin provides the `theme` service; it does not provide a third-party theme catalog or adapter manager.

## Goals

- Install and activate on official DeepSeek Harness v0.1.0-rc.7 through a local checkout, a packaged tarball, and a public GitHub reference.
- Preserve compatibility with rc.5 and rc.6 where the same profile-bundle and `theme` service interfaces are present.
- Remove all dependencies on non-official theme catalog and theme adapter services.
- Reduce the GitHub installation payload to at most 15 MiB of tracked runtime files while retaining the complete source distribution separately.
- Substantially reduce idle GPU composition without removing the day/night identity or the user's existing screenshots and artwork.
- Publish a bilingual v0.1.11 GitHub release with migration instructions, checksums, screenshots, and a verified installable package.
- Keep the CC-BY-NC-SA-4.0 non-commercial license and its prominent bilingual notice.

## Non-goals

- Reintroducing the custom Theme Plugins manager or host-wide theme catalog.
- Executing JavaScript from declarative ZIP theme packages.
- Changing DeepSeek Harness core packages or patching a user's Harness installation.
- Publishing to npm without authenticated ownership of a stable package name.
- Redesigning the accepted day/night artwork or changing the theme's visual composition.

## Compatibility Architecture

### Profile bundle

The package keeps the unique name `@dsh-external/dsh-client-ui-skin-deep-whale-day-night` and declares `dsh.bundle.patch` as `./cordis.patch.yml`.

The patch inserts one new row instead of augmenting a row owned by another bundle:

```yaml
- insert:
    - id: ui-skin-deep-whale-day-night
      name: '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'
```

The stable Loader id is unique to this package. Installation and removal therefore cannot collide with `ui-skin-maid-atelier` or depend on a row that official Harness does not provide.

### Host entry

The host entry remains a valid Cordis plugin but performs no registration. Its only purpose is to let the bundle row load normally while the package's `dsh.client` declaration exposes the browser half to the official client module graph.

`src/manifest.ts`, the host catalog registration, and all imports from `@deepseek-ai/dsh-host-theme-catalog` are removed.

### Browser entry

The browser manifest declares only the official dependency:

```json
{
  "dsh": {
    "client": {
      "inject": ["@deepseek-ai/dsh-client-ui-theme"],
      "platform": "web"
    }
  }
}
```

The browser plugin exports `inject = ['theme']`. Its `apply(ctx)` owns activation directly through `ctx.effect(() => activateMaidAtelier(ctx))`. Disposal restores every DOM node, attribute, title, theme-color value, observer, timer, and event listener already owned by the skin.

No browser or host entry waits for `themePlugins` or `themeCatalog`. The built client bundle must contain neither package name nor service name.

### Existing installations

Updating the existing dependency keeps the package name stable. Reconciliation continues to list the same bundle, while the new bundle patch replaces the ineffective target patch with a direct insert. Users who installed the pre-rename `@dsh-external/dsh-client-ui-skin-maid-atelier` receive explicit removal and install commands in the migration guide; the release does not silently modify their profile files.

## Lightweight Distribution

### Source channel

The default source branch retains the full editable project, design sources, scripts, tests, and selected artwork. It remains the development and attribution source of record.

### Runtime channel

A generated `runtime` branch contains only files required to install and run the theme:

- `package.json`
- `cordis.patch.yml`
- `lib/index.js`
- `lib/client.js`
- `skin.json`
- `preview/light.webp` and `preview/dark.webp`
- `README.md`, `CHANGELOG.md`, `LICENSE`, and `NOTICE`

Source maps, tests, raw assets, concept art, screenshots, generated TypeScript sources, build scripts, and tool configuration are excluded. The branch has a hard 15 MiB tracked-blob budget, checked before publication.

The documented GitHub installation spec becomes:

```powershell
dsh plugin --profile web add github:GGBond2424648901/deep-whale-day-night-theme#runtime
```

The public registry entry will be updated to the same pinned runtime channel. If the registry does not permit a direct push, the release work opens a pull request and links it from the release notes. The full source branch remains linked from the runtime README.

### Release artifact

The release contains an installable `.tgz` produced from the exact runtime manifest and a SHA-256 checksum file. The tarball is installed in a clean profile before it is attached to the release. GitHub's generated source archives remain available but are not presented as recommended installers.

The package is made packable and publication metadata is corrected, but npm publication is not part of v0.1.11 because the current environment has no npm authentication and the existing scope has no verified ownership. The release notes state this without presenting npm as a working channel.

## Performance Controller

### Motion modes

The skin owns one small controller with two modes:

- `balanced`: the default on an accelerated visible document. It creates at most ten atmosphere particles, keeps static full-screen light textures, and permits only small local companion/toggle animations.
- `reduced`: selected by `prefers-reduced-motion`, a major WebGL performance caveat, or an explicitly hidden document. It removes particle and full-screen continuous animation and uses static visual states.

The selected mode is reflected on the body as `data-maid-motion="balanced|reduced"`. `visibilitychange` pauses animation while the document is hidden and restores the detected mode when visible. Detection failures choose `reduced` rather than blocking activation.

### CSS cost controls

- Remove permanent `will-change` from atmosphere and trim layers. A finite transition may set it only under the existing transition data attribute, which is cleared when that transition finishes or times out.
- Replace moving full-screen caustic, halo, and star-field gradients with static layers in balanced mode.
- Limit atmosphere animation to transform and opacity on ten small elements.
- Disable all infinite theme-owned animations in reduced mode.
- Preserve backdrop filters on small cards and controls, but provide an opaque/semitransparent fallback in reduced mode for the largest surfaces.
- Pause the session-selection chase animation after its finite entrance instead of leaving a continuous one-second loop.

The day/night toggle, character scene, sidebar companion, glass cards, and color palette remain visually recognizable in both modes.

## Error Handling and Diagnostics

- A package check fails if `cordis.patch.yml` does not contain the unique direct-insert row.
- A dependency check fails if manifests or built bundles contain `themePlugins`, `themeCatalog`, `dsh-client-ui-theme-plugins`, or `dsh-host-theme-catalog`.
- A pack check fails when required runtime files are missing or the runtime budget exceeds 15 MiB.
- Install verification fails on any unmatched patch warning, unresolved peer warning owned by this package, import failure, pending client fiber, or missing theme body attribute.
- Documentation separates source checkout, runtime GitHub, and tarball commands so users do not accidentally install the 63.9 MB source channel.

## Verification Matrix

### Static and unit checks

- Typecheck, build, and package tests pass.
- Manifest tests assert the official-only dependency graph and unique row id.
- Lifecycle tests assert activation and complete disposal.
- Motion tests assert the ten-particle cap, reduced-motion behavior, hidden-document suspension, and absence of permanent `will-change` on continuous layers.
- Pack tests assert the allowlist, checksum, and size budget.

### Harness installation checks

Each check uses a fresh isolated `DSH_HOME` and official `@deepseek-ai/dsh@0.1.0-rc.7`:

1. Install from the local checkout.
2. Install from the generated `.tgz`.
3. Install from the public `runtime` GitHub branch after publication.
4. Update a profile that contains v0.1.10.
5. Dump the composed config and assert one `ui-skin-deep-whale-day-night` row with no unmatched patch warnings.
6. Boot the Web profile, load the page, and assert that the client plugin becomes active without missing services.
7. Switch light/dark, open a session, collapse and expand the sidebar, and verify theme persistence and teardown-relevant DOM ownership.
8. Remove the package and assert that the bundle row disappears from the profile composition.

The existing rc.5 development checkout is also built and browser-tested to guard the supported compatibility floor. Desktop 2.0 compatibility is established through its bundled profile/CLI install path; no desktop-only private API is introduced.

### Performance checks

Browser verification records the number of theme-owned animations and atmosphere elements at idle, in reduced motion, and while hidden. Acceptance requires:

- no more than ten atmosphere elements in balanced mode;
- zero running theme-owned infinite animations in reduced or hidden mode;
- no pending client-plugin fibers;
- no repeated DOM growth after theme changes or sidebar resizing.

GPU percentages vary by driver and cannot be a deterministic CI threshold. The release instead gates the concrete compositor inputs that caused the reported high usage and includes manual Task Manager confirmation in the release checklist.

## Release and Rollback

The release version is v0.1.11. Publication order is:

1. Merge verified source changes.
2. Build and verify the runtime package from the release commit.
3. Update the `runtime` branch to that package.
4. Test the public GitHub install from a clean profile.
5. Publish the GitHub release, `.tgz`, checksums, bilingual notes, screenshots, and migration commands.
6. Update the marketplace install reference and close or respond to issues #2, #5, #7, and #8 with the corresponding evidence.

The v0.1.10 tag and release remain unchanged as rollback evidence. If the public runtime install fails, the runtime branch is restored to its prior commit and v0.1.11 is not announced as verified.

## Security and Licensing

The theme remains a normal trusted Harness plugin and does not add remote code execution, token storage, or dynamic JavaScript theme imports. Runtime artifacts are built from the tagged source commit, checksummed, and published with the existing CC-BY-NC-SA-4.0 license, attribution, non-commercial notice, and asset provenance.
