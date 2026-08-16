import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = resolve(root, 'assets/concepts/raster-maid-lace')
const outputRoot = resolve(root, 'assets/generated')

// These sources were authored inside a genuinely shallow guide band. Exporting
// is deliberately crop-only: no resize step is allowed here, so bows, ruffles,
// pearls, and droplets can never be flattened to fill a viewport.
const strips = [
  {
    source: 'deep-whale-day-top-natural-alpha.png',
    output: 'deep-whale-day-top-lace.webp',
    top: 15,
  },
  {
    source: 'deep-whale-day-bottom-natural-alpha.png',
    output: 'deep-whale-day-bottom-lace.webp',
    top: 858,
  },
  {
    source: 'deep-whale-night-top-natural-alpha.png',
    output: 'deep-whale-night-top-lace.webp',
    top: 14,
  },
  {
    source: 'deep-whale-night-bottom-natural-alpha.png',
    output: 'deep-whale-night-bottom-lace.webp',
    top: 865,
  },
]

const OUTPUT_WIDTH = 1672
const OUTPUT_HEIGHT = 60

await mkdir(outputRoot, { recursive: true })

for (const strip of strips) {
  const sourcePath = resolve(sourceRoot, strip.source)
  const outputPath = resolve(outputRoot, strip.output)

  await sharp(sourcePath)
    .extract({ left: 0, top: strip.top, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT })
    .webp({ lossless: true, alphaQuality: 100, effort: 6 })
    .toFile(outputPath)

  process.stdout.write(`${strip.output}\n`)
}
