import { readFileSync } from 'node:fs'
import type { BuiltinThemeManifestRegistration, ThemePluginId } from '@deepseek-ai/dsh-host-theme-catalog'

const id = 'maid-atelier' as ThemePluginId
const light = new Uint8Array(readFileSync(new URL('../preview/light.webp', import.meta.url)))
const dark = new Uint8Array(readFileSync(new URL('../preview/dark.webp', import.meta.url)))

/** Complete, non-commercial Deep Whale catalog registration. */
export const MAID_ATELIER_REGISTRATION: BuiltinThemeManifestRegistration = Object.freeze({
  manifest: Object.freeze({
    formatVersion: 1,
    target: { application: 'deepseek-harness' as const, minVersion: '0.1.0-rc.5' },
    id,
    name: '深鲸昼夜',
    nameEn: 'Deep Whale Day & Night',
    version: '0.1.7',
    author: 'Small-tailqwq & Deep Whale contributors',
    description: 'DeepSeek Harness 的完整非商业 Deep Whale 昼夜主题 UI 包：包含水晶白昼与月潮夜晚场景、角色与 Q 版宠物、鲸鱼装饰、玻璃面板和轻量动态氛围；支持主机级主题卡片切换与完整撤销。仅供个人及其他非商业用途，禁止商用。Complete non-commercial Deep Whale day/night UI theme for DeepSeek Harness; personal and non-commercial use only.',
    license: 'CC-BY-NC-SA-4.0 — personal and non-commercial use only',
    entry: 'builtin.css',
    cover: 'preview/light.webp',
    previews: { light: 'preview/light.webp', dark: 'preview/dark.webp' },
    colorSchemes: ['light', 'dark'] as const,
  }),
  coverSources: Object.freeze({
    'preview/light.webp': { kind: 'bytes' as const, bytes: light, mediaType: 'image/webp' },
    'preview/dark.webp': { kind: 'bytes' as const, bytes: dark, mediaType: 'image/webp' },
  }),
})
