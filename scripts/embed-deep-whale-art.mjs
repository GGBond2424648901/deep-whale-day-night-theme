import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assets = [
  ['DEEP_WHALE_DAY_SCENE', 'image/webp', 'deep-whale-day-scene-v2.webp'],
  ['DEEP_WHALE_NIGHT_SCENE', 'image/webp', 'deep-whale-night-scene-v2.webp'],
  ['DEEP_WHALE_DAY_COMPANION', 'image/webp', 'deep-whale-day-companion-v1.webp'],
  ['DEEP_WHALE_NIGHT_COMPANION', 'image/webp', 'deep-whale-night-companion-v1.webp'],
  ['DEEP_WHALE_DAY_COMPOSER_RAIL', 'image/png', 'generated/composer-rail-day.png'],
  ['DEEP_WHALE_NIGHT_COMPOSER_RAIL', 'image/png', 'generated/composer-rail-night.png'],
  ['DEEP_WHALE_DAY_CONTENT_FRAME', 'image/png', 'generated/frame-nine-slice-day.png'],
  ['DEEP_WHALE_NIGHT_CONTENT_FRAME', 'image/png', 'generated/frame-nine-slice-night.png'],
  ['DEEP_WHALE_DAY_MEDALLION', 'image/png', 'generated/whale-medallion-day.png'],
  ['DEEP_WHALE_NIGHT_MEDALLION', 'image/png', 'generated/whale-medallion-night.png'],
  ['DEEP_WHALE_DAY_SOFT_NEW_SESSION', 'image/png', 'generated/soft-new-session-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_NEW_SESSION', 'image/png', 'generated/soft-new-session-night.png'],
  ['DEEP_WHALE_DAY_SOFT_WORKSPACE', 'image/png', 'generated/soft-workspace-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_WORKSPACE', 'image/png', 'generated/soft-workspace-night.png'],
  ['DEEP_WHALE_DAY_SOFT_SETTINGS', 'image/png', 'generated/soft-settings-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_SETTINGS', 'image/png', 'generated/soft-settings-night.png'],
  ['DEEP_WHALE_DAY_SOFT_TOP_TRIM', 'image/png', 'generated/soft-top-trim-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_TOP_TRIM', 'image/png', 'generated/soft-top-trim-night.png'],
  ['DEEP_WHALE_DAY_SOFT_BOTTOM_TRIM', 'image/png', 'generated/soft-bottom-trim-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_BOTTOM_TRIM', 'image/png', 'generated/soft-bottom-trim-night.png'],
  ['DEEP_WHALE_DAY_SOFT_SIDEBAR_CORNER', 'image/png', 'generated/soft-sidebar-corner-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_SIDEBAR_CORNER', 'image/png', 'generated/soft-sidebar-corner-night.png'],
  ['DEEP_WHALE_DAY_SOFT_CONTENT_FRAME', 'image/png', 'generated/soft-content-frame-day.png'],
  ['DEEP_WHALE_NIGHT_SOFT_CONTENT_FRAME', 'image/png', 'generated/soft-content-frame-night.png'],
]

const lines = [
  '/** Generated embedded artwork for the Deep Whale day/night skin. */',
  '',
]
for (const [name, mimeType, filename] of assets) {
  const encoded = readFileSync(resolve(root, 'assets', filename)).toString('base64')
  lines.push(`export const ${name} = 'data:${mimeType};base64,${encoded}'`)
  lines.push('')
}

writeFileSync(
  resolve(root, 'src/client/deep-whale-art.generated.ts'),
  `${lines.join('\n')}\n`,
)
