import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

const readText = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('standalone distribution metadata', () => {
  it('ships four exact transparent raster lace strips', async () => {
    const filenames = [
      'deep-whale-day-top-lace.webp',
      'deep-whale-day-bottom-lace.webp',
      'deep-whale-night-top-lace.webp',
      'deep-whale-night-bottom-lace.webp',
    ]

    for (const filename of filenames) {
      const metadata = await sharp(resolve(process.cwd(), 'assets/generated', filename)).metadata()
      expect(metadata.format).toBe('webp')
      expect(metadata.width).toBe(1672)
      expect(metadata.height).toBe(60)
      expect(metadata.hasAlpha).toBe(true)
    }
  })

  it('embeds the clean approved cover scenes independently from shipped framed plates', () => {
    const embedScript = readText('scripts/embed-deep-whale-art.mjs')

    expect(embedScript).toContain("['DEEP_WHALE_DAY_SCENE', 'image/webp', 'deep-whale-day-scene-v3-white-dress.webp']")
    expect(embedScript).toContain("['DEEP_WHALE_NIGHT_SCENE', 'image/webp', 'deep-whale-night-scene-v5.webp']")
    expect(embedScript).not.toMatch(/DEEP_WHALE_(?:DAY|NIGHT)_SCENE[^\n]+scene-v[12]\.webp/)
  })

  it('ships the approved full-scene frame artwork at desktop aspect ratio', async () => {
    for (const filename of [
      'deep-whale-day-scene-v4-framed.webp',
      'deep-whale-night-scene-v6-framed.webp',
    ]) {
      const metadata = await sharp(resolve(process.cwd(), 'assets', filename)).metadata()
      expect(metadata.format).toBe('webp')
      expect(metadata.width).toBe(1920)
      expect(metadata.height).toBe(1080)
    }
  })

  it('ships the public version, canonical skin identity, and complete attribution', () => {
    const packageText = readText('package.json')
    const skinText = readText('skin.json')
    const notice = readText('NOTICE')
    const manifest = JSON.parse(packageText) as { license: string, name: string, version: string }
    const skin = JSON.parse(skinText) as { name: string, nameEn: string, package: string, version: string }

    expect(manifest.version).toBe('0.1.11')
    expect(manifest.name).toBe('@dsh-external/dsh-client-ui-skin-deep-whale-day-night')
    expect(manifest.license).toBe('CC-BY-NC-SA-4.0')
    expect(skin.package).toBe(manifest.name)
    expect(skin.version).toBe(manifest.version)
    expect(skin.nameEn).toBe('Deep Whale Day & Night')
    expect(skin.name).toBe('鲸鱼娘昼夜工坊')
    expect(notice).toContain('上善')
    expect(notice).toContain('zipzip')
    expect(notice).toContain('Small-tailqwq')
    expect(notice).toContain('https://www.pixiv.net/users/62155430')
    expect(notice).toContain('https://www.pixiv.net/users/18604994')
    expect(notice).toContain('CC BY-NC-SA 4.0')
    expect(notice).toContain('No fake textures, No fake details.')

    for (const text of [packageText, skinText, notice]) {
      expect(text).not.toMatch(/[�娣椴涓]/u)
    }
  })

  it('documents the rc.7 lightweight install channels without obsolete theme services', () => {
    const readme = readText('README.md')

    expect(readme).toContain('@deepseek-ai/dsh@0.1.0-rc.7')
    expect(readme).toContain('github:GGBond2424648901/deep-whale-day-night-theme#runtime')
    expect(readme).toContain('.\\deep-whale-day-night-theme-0.1.11.tgz')
    expect(readme).toContain('https://github.com/GGBond2424648901/deep-whale-day-night-theme')
    expect(readme).toContain('![Deep Whale day theme](preview/light.webp)')
    expect(readme).toContain('![Deep Whale night theme](preview/dark.webp)')
    expect(readme).toContain('plugin --profile web update @dsh-external/dsh-client-ui-skin-deep-whale-day-night')
    expect(readme).toContain('plugin --profile web remove @dsh-external/dsh-client-ui-skin-maid-atelier')
    expect(readme).toContain('deepseek-harness-desktop')
    expect(readme).toContain('--dump-config')
    expect(readme).toContain('CC BY-NC-SA 4.0')
    expect(readme).toContain('禁止商用')
    expect(readme).not.toContain('themePlugins')
    expect(readme).not.toContain('themeCatalog')
    expect(readme).not.toContain('Theme Plugins manager')
  })

  it('packs only the lightweight installable runtime files', () => {
    const manifest = JSON.parse(readText('package.json')) as {
      files?: string[]
      private?: boolean
    }

    expect(manifest.private).not.toBe(true)
    expect(manifest.files).toEqual([
      'package.json',
      'cordis.patch.yml',
      'lib/index.js',
      'lib/client.js',
      'skin.json',
      'preview/light.webp',
      'preview/dark.webp',
      'README.md',
      'CHANGELOG.md',
      'LICENSE',
      'NOTICE',
    ])
  })

  it('inserts one unique standalone profile entry', () => {
    const patch = readText('cordis.patch.yml')

    expect(patch).toMatch(/^- insert:\s*\n\s*- id: ui-skin-deep-whale-day-night$/mu)
    expect(patch).toContain("name: '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'")
    expect(patch).not.toContain('ui-skin-maid-atelier')
  })
})
