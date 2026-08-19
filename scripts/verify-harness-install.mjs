import { spawnSync } from 'node:child_process'
import { copyFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolvePnpmInvocation } from './build-runtime-package.mjs'

const PACKAGE_NAME = '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'
const ROW_ID = 'ui-skin-deep-whale-day-night'

/**
 * Copy a local tarball beside the isolated profile before pnpm sees it.
 * This avoids Windows store-index paths that repeat a long source pathname.
 */
export async function stageLocalTarballSpec(packageSpec, home) {
  if (/^[a-z][a-z0-9+.-]*:\/\//iu.test(packageSpec)) return packageSpec
  if (!/\.tgz$/iu.test(packageSpec)) return packageSpec
  const staged = join(home, 'deep-whale-theme.tgz')
  await copyFile(resolve(packageSpec), staged)
  return staged
}

/** Assert that an official Harness config dump composes exactly one working theme row. */
export function assertCompatibleDump(stdout, stderr) {
  const diagnostics = `${stderr}\n${stdout}`
  if (/patch:\s*entry\s+.+not found|unmatched patch/iu.test(diagnostics)) {
    throw new Error(`Harness reported an unmatched patch:\n${diagnostics}`)
  }
  if (/themePlugins|themeCatalog|dsh-client-ui-theme-plugins|dsh-host-theme-catalog/iu.test(diagnostics)) {
    throw new Error(`Harness reported a legacy theme service dependency:\n${diagnostics}`)
  }
  const rows = stdout.match(new RegExp(`^- id: ${ROW_ID}$`, 'gmu')) ?? []
  if (rows.length !== 1) {
    throw new Error(`Expected ${ROW_ID} exactly once, found ${rows.length}`)
  }
}

function parseArgs(argv) {
  let packageSpec
  let dshVersion = '0.1.0-rc.7'
  let keepHome = false
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--package') packageSpec = argv[++index]
    else if (arg === '--dsh-version') dshVersion = argv[++index]
    else if (arg === '--keep-home') keepHome = true
    else throw new Error(`Unknown argument: ${arg}`)
  }
  if (packageSpec === undefined) throw new Error('Usage: --package <package-spec> [--dsh-version <version>] [--keep-home]')
  return { dshVersion, keepHome, packageSpec }
}

function runPnpm(args, environment) {
  const invocation = resolvePnpmInvocation(
    process.platform,
    process.execPath,
    process.env.npm_execpath,
    args,
  )
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: environment,
    timeout: 240_000,
  })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): pnpm ${args.join(' ')}\n${result.stderr || result.stdout}`)
  }
  return { stderr: result.stderr ?? '', stdout: result.stdout ?? '' }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const home = await mkdtemp(join(tmpdir(), 'deep-whale-dsh-'))
  const environment = { ...process.env, DSH_HOME: home }
  const dsh = `@deepseek-ai/dsh@${options.dshVersion}`
  const installSpec = await stageLocalTarballSpec(options.packageSpec, home)
  let completed = false

  try {
    const install = runPnpm(
      ['dlx', dsh, 'plugin', '--profile', 'web', 'add', installSpec],
      environment,
    )
    const installDiagnostics = `${install.stderr}\n${install.stdout}`
    if (/Issues with peer dependencies[\s\S]*@dsh-external\/dsh-client-ui-skin-deep-whale-day-night/iu
      .test(installDiagnostics)) {
      throw new Error(`Theme installation reported missing peers:\n${installDiagnostics}`)
    }

    const dump = runPnpm(['dlx', dsh, '--profile', 'web', '--dump-config'], environment)
    assertCompatibleDump(dump.stdout, dump.stderr)

    runPnpm(['dlx', dsh, 'plugin', '--profile', 'web', 'remove', PACKAGE_NAME], environment)
    const removed = runPnpm(['dlx', dsh, '--profile', 'web', '--dump-config'], environment)
    const remaining = removed.stdout.match(new RegExp(`^- id: ${ROW_ID}$`, 'gmu')) ?? []
    if (remaining.length !== 0) throw new Error(`Theme row remained after removal (${remaining.length})`)

    completed = true
    process.stdout.write(`${JSON.stringify({
      dshVersion: options.dshVersion,
      home: options.keepHome ? home : undefined,
      install: 'passed',
      package: options.packageSpec,
      removal: 'passed',
      rowCount: 1,
    }, null, 2)}\n`)
  } finally {
    if (!options.keepHome) await rm(home, { force: true, recursive: true })
    else if (!completed) process.stderr.write(`Retained failed verification home: ${home}\n`)
  }
}

if (process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
