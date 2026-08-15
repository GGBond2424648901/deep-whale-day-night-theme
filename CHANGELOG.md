# Changelog

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
