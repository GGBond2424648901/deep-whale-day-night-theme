import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, parse, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Files required by a built Deep Whale profile bundle at install time. */
export const RUNTIME_FILES = Object.freeze([
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

/** Maximum uncompressed byte count accepted for the runtime branch. */
export const MAX_RUNTIME_BYTES = 15 * 1024 * 1024

/**
 * Resolve a pnpm subprocess without asking Node to spawn a Windows cmd shim.
 * @param {NodeJS.Platform} platform current operating system.
 * @param {string} nodeExecPath current Node executable.
 * @param {string | undefined} npmExecPath pnpm's JavaScript entry from the parent script.
 * @param {string[]} args pnpm arguments.
 * @returns {{args: string[], command: string}} subprocess invocation.
 */
export function resolvePnpmInvocation(platform, nodeExecPath, npmExecPath, args) {
  if (platform !== 'win32') return { args, command: 'pnpm' }
  if (npmExecPath === undefined) {
    throw new Error('Run this command through pnpm so npm_execpath identifies the Windows pnpm entry')
  }
  return { args: [npmExecPath, ...args], command: nodeExecPath }
}

/**
 * Copy the runtime allowlist into a clean directory and enforce its byte budget.
 * @param {string} sourceRoot complete source package root.
 * @param {string} outputRoot explicit staging directory.
 * @returns {Promise<{bytes: number, files: readonly string[]}>} staged payload summary.
 */
export async function stageRuntimePackage(sourceRoot, outputRoot) {
  const source = resolve(sourceRoot)
  const output = resolve(outputRoot)
  if (output === source || output === parse(output).root) {
    throw new Error(`Refusing unsafe runtime output: ${output}`)
  }

  await rm(output, { force: true, recursive: true })
  await mkdir(output, { recursive: true })

  let bytes = 0
  for (const path of RUNTIME_FILES) {
    const target = resolve(output, path)
    await mkdir(dirname(target), { recursive: true })
    await copyFile(resolve(source, path), target)
    bytes += (await stat(target)).size
  }

  if (bytes > MAX_RUNTIME_BYTES) {
    throw new Error(`Runtime package is ${bytes} bytes; limit is ${MAX_RUNTIME_BYTES}`)
  }
  return { bytes, files: RUNTIME_FILES }
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const stage = resolve(root, 'dist/runtime-package')
  const release = resolve(root, 'dist/release')
  const summary = await stageRuntimePackage(root, stage)
  await rm(release, { force: true, recursive: true })
  await mkdir(release, { recursive: true })

  const invocation = resolvePnpmInvocation(
    process.platform,
    process.execPath,
    process.env.npm_execpath,
    ['pack', '--pack-destination', release],
  )
  const packed = spawnSync(invocation.command, invocation.args, {
    cwd: stage,
    encoding: 'utf8',
  })
  if (packed.error !== undefined) throw packed.error
  if (packed.status !== 0) {
    throw new Error(`pnpm pack failed:\n${packed.stderr || packed.stdout}`)
  }
  const printedPath = packed.stdout.trim().split(/\r?\n/u).findLast(line => line.endsWith('.tgz'))
  if (printedPath === undefined) throw new Error(`pnpm pack did not report a tarball:\n${packed.stdout}`)
  const tarball = resolve(stage, printedPath)
  const digest = createHash('sha256').update(await readFile(tarball)).digest('hex')
  const checksum = `${tarball}.sha256`
  await writeFile(checksum, `${digest}  ${basename(tarball)}\n`, 'utf8')

  process.stdout.write(`${JSON.stringify({
    bytes: summary.bytes,
    sha256: checksum,
    stage,
    tarball,
  }, null, 2)}\n`)
}

if (process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
