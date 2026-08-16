import { describe, expect, it } from 'vitest'

import {
  createMaidLaceCluster,
  createMaidLaceCrown,
  DEEP_WHALE_DAY_ORNAMENTS,
  DEEP_WHALE_NIGHT_ORNAMENTS,
  DEEP_WHALE_ORNAMENT_PROPERTIES,
} from '../src/client/ornament-art.ts'

const laceProperties = [
  '--maid-top-crown-art',
  '--maid-bottom-crown-art',
  '--maid-left-cluster-art',
  '--maid-right-cluster-art',
] as const

const rasterLaceProperties = [
  '--maid-top-lace-raster-art',
  '--maid-bottom-lace-raster-art',
] as const

function decodeArtwork(value: string): string {
  const match = value.match(/^url\("data:image\/svg\+xml,([^]*)"\)$/)
  expect(match).not.toBeNull()
  return decodeURIComponent(match![1])
}

describe('Deep Whale maid-lace ornament artwork', () => {
  it('publishes four independent embedded raster lace strips', () => {
    const day = DEEP_WHALE_DAY_ORNAMENTS as Readonly<Record<string, string>>
    const night = DEEP_WHALE_NIGHT_ORNAMENTS as Readonly<Record<string, string>>

    for (const property of rasterLaceProperties) {
      expect(DEEP_WHALE_ORNAMENT_PROPERTIES).toContain(property)
      expect(day[property]).toMatch(/^url\("data:image\/webp;base64,/)
      expect(night[property]).toMatch(/^url\("data:image\/webp;base64,/)
      expect(day[property]).not.toBe(night[property])
    }
    expect(day['--maid-top-lace-raster-art']).not.toBe(day['--maid-bottom-lace-raster-art'])
    expect(night['--maid-top-lace-raster-art']).not.toBe(night['--maid-bottom-lace-raster-art'])
  })

  it('publishes independent day and night lace artwork maps', () => {
    for (const property of laceProperties) {
      expect(DEEP_WHALE_ORNAMENT_PROPERTIES).toContain(property)
      expect(DEEP_WHALE_DAY_ORNAMENTS[property]).toMatch(/^url\("data:image\/svg\+xml,/)
      expect(DEEP_WHALE_NIGHT_ORNAMENTS[property]).toMatch(/^url\("data:image\/svg\+xml,/)
      expect(DEEP_WHALE_DAY_ORNAMENTS[property]).not.toBe(DEEP_WHALE_NIGHT_ORNAMENTS[property])
    }
  })

  it('builds compact crowns with distinct textile motifs inside the 44px safety depth', () => {
    const dayTop = createMaidLaceCrown('day', 'top')
    const nightTop = createMaidLaceCrown('night', 'top')
    const dayBottom = createMaidLaceCrown('day', 'bottom')
    const nightBottom = createMaidLaceCrown('night', 'bottom')

    expect(dayTop).toContain('viewBox="0 0 520 60"')
    expect(nightTop).toContain('viewBox="0 0 520 60"')
    expect(dayBottom).toContain('viewBox="0 0 460 60"')
    expect(nightBottom).toContain('viewBox="0 0 460 60"')
    for (const svg of [dayTop, nightTop, dayBottom, nightBottom]) {
      expect(svg).toContain('data-maid-lace-depth="44"')
      expect(svg).toContain('data-lace-motif="ruffle"')
      expect(svg).toContain('data-lace-motif="satin-bow"')
      expect(svg).toContain('data-lace-motif="shell-rosette"')
      expect(svg).toContain('vector-effect="non-scaling-stroke"')
      expect(svg).not.toContain('data-palace-motif')
      expect(svg).not.toContain('ruler-tick')
    }
    expect(dayTop).toContain('data-lace-motif="floral-eyelet"')
    expect(nightTop).toContain('data-lace-motif="moon-star-eyelet"')
    expect(dayTop).not.toBe(nightTop)
  })

  it('builds authored 128x44 side flourishes and mirrors only the right group', () => {
    const dayLeft = createMaidLaceCluster('day', 'left')
    const dayRight = createMaidLaceCluster('day', 'right')
    const nightLeft = createMaidLaceCluster('night', 'left')

    for (const svg of [dayLeft, dayRight, nightLeft]) {
      expect(svg).toContain('viewBox="0 0 128 44"')
      expect(svg).toContain('data-maid-lace-depth="44"')
      expect(svg).toContain('data-lace-motif="side-ruffle"')
      expect(svg).toContain('data-lace-motif="side-bow"')
      expect(svg).toContain('data-lace-motif="side-rosette"')
      expect(svg).toContain('vector-effect="non-scaling-stroke"')
    }
    expect(dayLeft).not.toBe(dayRight)
    expect(dayRight).toContain('transform="translate(128 0) scale(-1 1)"')
    expect(nightLeft).toContain('data-lace-motif="crescent-shell"')
  })

  it('stores the maid-lace builders as decodable inline SVG data URLs', () => {
    expect(decodeArtwork(DEEP_WHALE_DAY_ORNAMENTS['--maid-top-crown-art']))
      .toBe(createMaidLaceCrown('day', 'top'))
    expect(decodeArtwork(DEEP_WHALE_NIGHT_ORNAMENTS['--maid-right-cluster-art']))
      .toBe(createMaidLaceCluster('night', 'right'))
  })
})
