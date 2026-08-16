# Changelog

## 0.1.9 - 2026-08-17

- Split the clean day/night character scenes from the viewport frame so scene `cover` cropping can no longer clip or displace the UI ornaments. / 将干净的昼夜角色场景与视口边框拆分，场景的 `cover` 裁切不再裁掉或带偏 UI 装饰。
- Added a main-pane-owned responsive frame with four fixed-aspect transparent corners, fixed whale crests, and flexible pearl connector rails. / 新增归属于主内容区的响应式边框：四个固定比例透明角花、固定鲸鱼徽章和可伸缩珍珠连接链。
- Unified the top crest, composer, and bottom crest on the scrollbar-adjusted main-pane centerline across expanded and compact sidebars. / 在侧栏展开与收起状态下，顶部徽章、输入框与底部徽章统一使用扣除滚动条后的主区中线。
- Verified day/night landing and active-conversation layouts at a 1280×720 viewport, a stricter effective main width than a 2048px display at 150% browser zoom; all measured center deltas are zero. / 已在 1280×720 视口验证昼夜欢迎页与活动会话页，其有效主区宽度比 2048px 屏幕的 150% 放大更苛刻；所有中心偏差测量均为 0。

## 0.1.8 - 2026-08-16

- Renamed the package to `@dsh-external/dsh-client-ui-skin-deep-whale-day-night` while retaining the stable Harness wiring ID. / 将包重命名为 `@dsh-external/dsh-client-ui-skin-deep-whale-day-night`，同时保留稳定的 Harness wiring ID。
- Added the approved framed day/night source plates and fixed the command-palette stacking behavior. / 加入确认的昼夜带框源图，并修复命令候选窗口的层级行为。

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
