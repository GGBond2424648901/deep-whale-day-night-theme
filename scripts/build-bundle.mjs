/**
 * Build the installable halves of the Deep Whale profile bundle.
 *
 * The browser half must be wrapped in the Harness module envelope
 * (`window.__ModuleLoader__.load({ id, factory })`) and its stylesheet has to
 * be injected by the module itself, because a client plugin is delivered as a
 * single script with no companion asset requests. This script is the
 * standalone replacement for the monorepo-internal `clientBundle` tsdown
 * preset the package was originally published with.
 */
import { build, transform } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ID = '@dsh-external/dsh-client-ui-skin-deep-whale-day-night'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Turn a `*.module.css` import into the style-injection module the Harness
 * client runtime expects, so the compiled sheet travels inside the bundle.
 * @returns {import('esbuild').Plugin} the stylesheet loader plugin.
 */
function stylesheetPlugin() {
  return {
    name: 'dsh-plugin-stylesheet',
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8')
        const { code } = await transform(source, { loader: 'css', minify: true })
        const tagId = `${PACKAGE_ID}/${basename(args.path)}`
        return {
          loader: 'js',
          contents: [
            `const css = ${JSON.stringify(code)};`,
            `const tagId = ${JSON.stringify(tagId)};`,
            'if (typeof document !== "undefined"',
            '  && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {',
            '  const tag = document.createElement("style");',
            `  tag.dataset.plugin = ${JSON.stringify(PACKAGE_ID)};`,
            '  tag.dataset.pluginCss = tagId;',
            '  tag.textContent = css;',
            '  document.head.appendChild(tag);',
            '}',
            'export default css;',
          ].join('\n'),
        }
      })
    },
  }
}

/**
 * Wrap compiled CJS in the `window.__ModuleLoader__.load` envelope the web
 * client uses to register a plugin module by package id.
 * @param {string} code compiled module body.
 * @returns {string} loadable client bundle.
 */
function wrapClientBundle(code) {
  return [
    'window.__ModuleLoader__.load({',
    `\tid: ${JSON.stringify(PACKAGE_ID)},`,
    '\tfactory: (require) => {',
    '\t\tvar module = { exports: {} };',
    '\t\tvar exports = module.exports;',
    '\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
    code,
    '\t\treturn module.exports;',
    '\t}',
    '});',
    '',
  ].join('\n')
}

async function main() {
  await mkdir(resolve(root, 'lib'), { recursive: true })

  const client = await build({
    absWorkingDir: root,
    bundle: true,
    entryPoints: [resolve(root, 'src/client/index.ts')],
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    legalComments: 'none',
    minify: false,
    sourcemap: 'external',
    outfile: resolve(root, 'lib/client.js'),
    write: false,
    logLevel: 'warning',
    plugins: [stylesheetPlugin()],
  })

  const clientJs = client.outputFiles.find((file) => file.path.endsWith('.js'))
  const clientMap = client.outputFiles.find((file) => file.path.endsWith('.map'))
  if (clientJs === undefined) throw new Error('esbuild produced no client bundle')
  await writeFile(
    resolve(root, 'lib/client.js'),
    `${wrapClientBundle(clientJs.text)}\n//# sourceMappingURL=client.js.map\n`,
  )
  if (clientMap !== undefined) {
    await writeFile(resolve(root, 'lib/client.js.map'), clientMap.text)
  }

  const host = await build({
    absWorkingDir: root,
    bundle: true,
    entryPoints: [resolve(root, 'src/index.ts')],
    format: 'esm',
    platform: 'node',
    target: 'es2022',
    legalComments: 'none',
    write: false,
    logLevel: 'warning',
  })

  await writeFile(resolve(root, 'lib/index.js'), host.outputFiles[0].text)
  process.stdout.write('built lib/index.js and lib/client.js\n')
}

await main()
