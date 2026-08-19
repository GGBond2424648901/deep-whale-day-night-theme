import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { assertCompatibleDump, stageLocalTarballSpec } from '../scripts/verify-harness-install.mjs'

describe('official Harness config verification', () => {
  it('accepts exactly one unique Deep Whale profile row', () => {
    expect(() => assertCompatibleDump(
      "- id: ui-skin-deep-whale-day-night\n  name: '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'\n",
      '',
    )).not.toThrow()
  })

  it('rejects unmatched legacy patches', () => {
    expect(() => assertCompatibleDump('', 'patch: entry "ui-skin-maid-atelier" not found'))
      .toThrow(/unmatched patch/i)
  })

  it('rejects unavailable legacy theme services', () => {
    expect(() => assertCompatibleDump('', 'pending (waiting for service: themePlugins)'))
      .toThrow(/legacy theme service/i)
  })

  it('rejects absent or duplicate profile rows', () => {
    expect(() => assertCompatibleDump('', '')).toThrow(/exactly once/i)
    expect(() => assertCompatibleDump(
      '- id: ui-skin-deep-whale-day-night\n- id: ui-skin-deep-whale-day-night\n',
      '',
    )).toThrow(/exactly once/i)
  })
})

describe('local tarball staging', () => {
  it('copies a local tarball to the short isolated home before invoking pnpm', async () => {
    const sourceRoot = await mkdtemp(join(tmpdir(), 'deep-whale-source-'))
    const home = await mkdtemp(join(tmpdir(), 'deep-whale-home-'))
    const source = join(sourceRoot, 'deep-whale-day-night-theme-0.1.12.tgz')
    await writeFile(source, 'verified tarball')

    const staged = await stageLocalTarballSpec(source, home)

    expect(staged).toBe(join(home, 'deep-whale-theme.tgz'))
    expect(await readFile(staged, 'utf8')).toBe('verified tarball')
    expect(await stageLocalTarballSpec('github:owner/theme#runtime', home))
      .toBe('github:owner/theme#runtime')
  })

  it('leaves HTTPS release tarball specs unchanged', async () => {
    const home = await mkdtemp(join(tmpdir(), 'deep-whale-url-stage-'))
    const url = 'https://github.com/owner/theme/releases/download/v1.0.0/theme.tgz'

    expect(await stageLocalTarballSpec(url, home)).toBe(url)
  })
})
