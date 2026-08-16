# Changelog

## 0.1.8 - 2026-08-16

- Renamed the package to `@dsh-external/dsh-client-ui-skin-deep-whale-day-night` so it no longer conflicts with the existing maid-atelier package, while retaining the stable `ui-skin-maid-atelier` wiring ID for installed Harness profiles. / 将包名改为 `@dsh-external/dsh-client-ui-skin-deep-whale-day-night`，解决与既有 maid-atelier 包重名的问题，同时保留稳定的 `ui-skin-maid-atelier` wiring ID，避免破坏已安装的 Harness 配置。
- Replaced the standalone stretched outer trim with full 1920×1080 day and night scenes whose top, bottom, four-corner frame, and center whale crests are integrated into the artwork. / 使用完整 1920×1080 昼夜场景替代独立拉伸花边，将顶部、底部、四角边框与中央鲸鱼徽章直接融入背景画面。
- Refined the daytime character to the approved shy, vulnerable expression with strong blush and a small rounded, slightly parted worried mouth; refined the night character toward a mature, alluring expression. / 白昼角色调整为确认的羞涩、楚楚可怜表情，保留明显红晕与小而圆润、微张的担忧嘴型；黑夜角色调整为更成熟、具有吸引力的神态。
- Raised the composer only while its command listbox is open, preventing the native command palette from being covered by the workspace and mode selector row without changing normal page stacking. / 仅在命令候选列表打开时提高输入区层级，避免命令窗口被工作区与模式选择行遮挡，同时不改变页面平时的图层关系。
- Retained proportional raster lace exports as optional source material and kept the fixed image-generation cleanup rule `No fake textures, No fake details.`. / 保留等比例栅格蕾丝导出作为可选素材，并继续采用固定图片生成清理规则 `No fake textures, No fake details.`。

## 0.1.7 - 2026-08-16

- Registered Deep Whale as a reversible builtin adapter for the Host-managed Theme Plugins settings page; the complete skin remains inert until selected and cleans up every owned browser effect when deselected.
- Added a richer bilingual catalog description and an explicit card-level CC BY-NC-SA 4.0 non-commercial notice.
- Documented the boundary between the complete reviewed JavaScript plugin and safe declarative ZIP or public GitHub imports.
- Kept upgraded Harness profiles compatible by augmenting the official Deep Whale Loader row instead of inserting a duplicate id.
- Updated the full-page day and night screenshots supplied from the verified runtime and prepared the v0.1.7 standalone distribution.

## 0.1.6 - 2026-08-16

- Lowered the day/night sidebar companion from content layer 3 to background layer 1 without moving or resizing the artwork, keeping native workspace and session content above it.
- Made selected and hovered session surfaces translucent glass with restrained backdrop blur, so long session lists remain readable and interactive while the companion stays softly visible underneath.
- Preserved the expanded and collapsed sidebar geometry, footer/settings ornament, session ordering, and day/night palette behavior.
- Refreshed the full-page day and night screenshots and rebuilt the standalone package for the v0.1.6 runtime state.

## 0.1.5 - 2026-08-16

- Shifted the full-scale white-dress daytime scene 60px to the right relative to v0.1.4, revealing more hair, sleeves, and skirt without resizing the character.
- Added `deep-whale-night-scene-v5.webp`, regenerated from the softer V3 character direction with V3's gentle posture, a restrained shy blush and reddish-pink parted lips, and the daytime scene's matched visible height and left-safe placement.
- Kept V3 and V4 night scenes as reusable source artwork and retained the fixed GPT Image 2 cleanup rule `No fake textures, No fake details.`.
- Refreshed the full-page day and night screenshots and rebuilt the standalone package for the v0.1.5 runtime state.

## 0.1.4 - 2026-08-16

- Made `deep-whale-day-scene-v3-white-dress.webp` the embedded daytime runtime default while preserving its full scale and existing left offset.
- Kept the navy-and-white maid V3 scene and all earlier day variants in `assets/` as reusable source artwork instead of deleting or overwriting them.
- Added `deep-whale-night-scene-v4.webp`, regenerated so the night character matches the daytime character height and left-safe placement; retained V3 as source artwork.
- Unified the runtime scene offset after matching both character compositions, while preserving the fixed cleanup prompt rule, attribution chain, and non-commercial license.
- Refreshed the repository's full-page day and night screenshots to show the v0.1.4 runtime state.

## 0.1.3 - 2026-08-16

- Replaced the runtime defaults with the corrected V3 pair: a full-scale navy-and-white daytime maid moved left without resizing, and the exact user-selected night scene.
- Added separate day and night background offsets so each character's face and upper body remain visible beside conversation cards while preserving the original artwork scale.
- Included `deep-whale-day-scene-v3-white-dress.webp` as an optional full-scale, left-shifted white-dress source asset.
- Retained the fixed GPT Image 2 cleanup rule `No fake textures, No fake details.` for generated scene variants.

## 0.1.2 - 2026-08-15

- Regenerated the selected day and night scenes with GPT Image 2 using the fixed prompt rule `No fake textures, No fake details.` to reduce invented diamond-like surface patterns and decorative noise.
- Shifted both characters farther left while preserving their identities, poses, clothing, rooms, and lighting, leaving the active conversation column clear.
- Kept the original v1 artwork alongside the new v2 source assets while making the v2 pair the embedded runtime default.

## 0.1.1 - 2026-08-15

- Fixed the expanded sidebar search layout so its full 54px control height participates in document flow instead of overflowing upward beneath the new-session ornament.
- Preserved a measured 10px visual clearance in both day and night themes while keeping search typing and result filtering interactive.

## 0.1.0 - 2026-08-14

- Added complete crystal-workshop day and moon-tide observatory night scenes with synchronized characters, transparent sidebar companions, component palettes, and system title colors.
- Added full-page top and bottom flourishes, fixed whale-tail crests, proportional composer crown rails, sidebar ribbons, workspace ornaments, and nine-slice component frames.
- Added semantic component coverage for sessions, workspaces, messages, context, thinking rows, composer controls, menus, settings, tools, Todo, terminal, title bar, and collapsed sidebar.
- Added deterministic day bubbles and night stars with reduced-motion support and transform/opacity-only animation loops.
- Added standalone distribution metadata, complete CC BY-NC-SA 4.0 attribution, prebuilt output, tests, compact previews, and full-page day/night screenshots.
