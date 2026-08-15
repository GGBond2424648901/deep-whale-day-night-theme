import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readText = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('standalone distribution metadata', () => {
  it('embeds the white-dress v3 day and exact selected night scene assets', () => {
    const embedScript = readText('scripts/embed-deep-whale-art.mjs')

    expect(embedScript).toContain("['DEEP_WHALE_DAY_SCENE', 'image/webp', 'deep-whale-day-scene-v3-white-dress.webp']")
    expect(embedScript).toContain("['DEEP_WHALE_NIGHT_SCENE', 'image/webp', 'deep-whale-night-scene-v4.webp']")
    expect(embedScript).not.toMatch(/DEEP_WHALE_(?:DAY|NIGHT)_SCENE[^\n]+scene-v[12]\.webp/)
  })

  it('ships the public version, canonical skin identity, and complete attribution', () => {
    const packageText = readText('package.json')
    const skinText = readText('skin.json')
    const notice = readText('NOTICE')
    const manifest = JSON.parse(packageText) as { license: string, version: string }
    const skin = JSON.parse(skinText) as { name: string, nameEn: string }

    expect(manifest.version).toBe('0.1.4')
    expect(manifest.license).toBe('CC-BY-NC-SA-4.0')
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
})
