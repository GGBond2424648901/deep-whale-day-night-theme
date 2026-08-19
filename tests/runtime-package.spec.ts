import { access, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  MAX_RUNTIME_BYTES,
  RUNTIME_FILES,
  resolvePnpmInvocation,
  stageRuntimePackage,
} from '../scripts/build-runtime-package.mjs'

const temporaryRoots: string[] = []

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map(path => rm(path, { force: true, recursive: true })))
})

describe('runtime package staging', () => {
  it('runs the JavaScript pnpm entry instead of spawning a Windows cmd shim', () => {
    expect(resolvePnpmInvocation('win32', 'C:/node/node.exe', 'C:/pnpm/pnpm.cjs', ['pack']))
      .toEqual({
        args: ['C:/pnpm/pnpm.cjs', 'pack'],
        command: 'C:/node/node.exe',
      })
    expect(resolvePnpmInvocation('linux', '/usr/bin/node', undefined, ['pack']))
      .toEqual({ args: ['pack'], command: 'pnpm' })
  })

  it('publishes only the installable allowlist below the byte budget', async () => {
    expect(RUNTIME_FILES).toEqual([
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
    expect(MAX_RUNTIME_BYTES).toBe(15 * 1024 * 1024)

    const temporaryRoot = await mkdtemp(join(tmpdir(), 'deep-whale-runtime-'))
    temporaryRoots.push(temporaryRoot)
    const output = join(temporaryRoot, 'package')
    const result = await stageRuntimePackage(resolve(process.cwd()), output)

    expect(result.files).toEqual(RUNTIME_FILES)
    expect(result.bytes).toBeLessThanOrEqual(MAX_RUNTIME_BYTES)
    for (const path of RUNTIME_FILES) {
      await expect(access(join(output, path))).resolves.toBeUndefined()
    }
    for (const path of ['src', 'tests', 'assets', 'screenshots', 'lib/client.js.map']) {
      await expect(access(join(output, path))).rejects.toThrow()
    }
  })
})
