// @vitest-environment jsdom
/**
 * Maid Atelier skin apply spec — the template contract: the body
 * attribute the stylesheet is scoped on is set on apply and retracted on
 * dispose, and every injected chrome element (marked data-skin-chrome) is
 * removed. Extend with assertions specific to your surface.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context, type Fiber } from '@deepseek-ai/cordis'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as skin from '../src/client/index.ts'

const CSS = readFileSync(resolve(process.cwd(), 'src/client/maid-atelier.module.css'), 'utf8')

const ORNAMENT_PROPERTIES = [
  '--maid-top-trim-art',
  '--maid-bottom-trim-art',
  '--maid-top-lace-raster-art',
  '--maid-bottom-lace-raster-art',
  '--maid-top-flourish-art',
  '--maid-bottom-flourish-art',
  '--maid-top-crown-art',
  '--maid-bottom-crown-art',
  '--maid-left-cluster-art',
  '--maid-right-cluster-art',
  '--maid-bottom-crest-art',
  '--maid-center-crest-art',
  '--maid-composer-rail-art',
  '--maid-content-frame-art',
  '--maid-new-session-art',
  '--maid-new-session-icon-art',
  '--maid-sidebar-footer-art',
  '--maid-sidebar-corner-art',
  '--maid-composer-frame-art',
  '--maid-settings-frame-art',
  '--maid-workspace-crest-art',
  '--maid-workspace-ribbon-art',
] as const

const SVG_ORNAMENT_PROPERTIES = new Set<string>([
  '--maid-top-trim-art',
  '--maid-bottom-trim-art',
  '--maid-top-crown-art',
  '--maid-bottom-crown-art',
  '--maid-left-cluster-art',
  '--maid-right-cluster-art',
  '--maid-sidebar-footer-art',
])

const WEBP_ORNAMENT_PROPERTIES = new Set<string>([
  '--maid-top-lace-raster-art',
  '--maid-bottom-lace-raster-art',
])

function ornamentMediaType(property: string): string {
  if (SVG_ORNAMENT_PROPERTIES.has(property)) return 'data:image/svg+xml'
  if (WEBP_ORNAMENT_PROPERTIES.has(property)) return 'data:image/webp;base64'
  return 'data:image/png;base64'
}

let fiber: Fiber | undefined

async function mount(): Promise<Fiber> {
  const ctx = new Context()
  ctx.provide('theme', {
    getTheme: () => ({ active: { colorScheme: document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light' } }),
    setTheme: (id: string) => {
      if (id === 'dark') document.body.dataset.dsDarkTheme = ''
      else delete document.body.dataset.dsDarkTheme
    },
  } as never)
  const f = ctx.plugin((activationCtx: Context) => {
    activationCtx.effect(() => skin.activateMaidAtelier(activationCtx))
  })
  await f.await()
  return f
}

/** Let jsdom deliver the current MutationObserver checkpoint. */
async function flushMutations(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

function embeddedPngFromCssUrl(value: string): Buffer {
  const encoded = value.match(/data:image\/png;base64,([^"']+)/)?.[1]
  if (encoded === undefined) throw new Error('Expected an embedded PNG CSS URL')
  return Buffer.from(encoded, 'base64')
}

function pngDimensions(png: Buffer): { height: number, width: number } {
  if (png.toString('ascii', 1, 4) !== 'PNG') throw new Error('Expected a PNG signature')
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

afterEach(async () => {
  await fiber?.dispose()
  fiber = undefined
  vi.unstubAllGlobals()
  delete (document as Document & { startViewTransition?: unknown }).startViewTransition
  document.body.innerHTML = ''
  delete document.body.dataset.dsDarkTheme
  document.title = ''
  document.head.querySelectorAll('[data-maid-test-style]').forEach(element => element.remove())
})

describe('Maid Atelier skin apply', () => {
  it('declares only the public rc.6 client manifest', () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))
    expect(manifest.dsh.client).toEqual({
      inject: ['@deepseek-ai/dsh-client-ui-theme', '@deepseek-ai/dsh-client-ui-theme-plugins'],
      platform: 'web',
    })
    expect((skin as { inject?: string[] }).inject).toEqual(['theme', 'themePlugins'])
    expect(manifest).not.toHaveProperty('dshClient')
    expect(manifest.peerDependencies).toHaveProperty('@deepseek-ai/cordis', '^4.0.1')
  })

  it('stays visually inert until the Theme Plugins runtime activates its adapter', async () => {
    const ctx = new Context()
    ctx.provide('theme', { setTheme: vi.fn() } as never)
    let adapter: { activate(): () => void } | undefined
    ctx.provide('themePlugins', {
      registerAdapter: (candidate: unknown) => {
        adapter = candidate as { activate(): () => void }
        return () => {}
      },
    } as never)
    const registered = ctx.plugin({ inject: skin.inject, apply: skin.apply })
    await registered.await()
    expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(false)
    const dispose = adapter!.activate()
    expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(true)
    dispose()
    expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(false)
    await registered.dispose()
  })

  it('sets the body attribute and retracts it on dispose', async () => {
    fiber = await mount()
    expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(true)
    await fiber.dispose()
    expect(document.body.hasAttribute('data-dsh-maid-atelier')).toBe(false)
  })

  it('matches Web-app system controls to day and night, then restores the presenter color', async () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#ffffff'
    document.head.append(meta)

    fiber = await mount()
    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1)
    expect(meta.content).toBe('#edf7ff')

    meta.content = '#dce6f5'
    await flushMutations()
    expect(meta.content).toBe('#edf7ff')

    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    expect(meta.content).toBe('#071632')

    await fiber.dispose()
    expect(meta.content).toBe('#ffffff')
    meta.remove()
  })

  it('injects chrome and retracts every element on dispose', async () => {
    fiber = await mount()
    expect(document.body.querySelectorAll('[data-skin-chrome]').length).toBeGreaterThan(0)
    expect(document.body.querySelector("[data-skin-chrome='responsive-frame']")).toBeNull()
    expect(document.body.querySelectorAll('[data-skin-frame-part]')).toHaveLength(0)
    expect(document.body.querySelectorAll('[data-skin-trim-layer]')).toHaveLength(2)
    expect(document.body.querySelectorAll("[data-skin-trim-part='crown']")).toHaveLength(3)
    expect(document.body.querySelectorAll("[data-skin-trim-part='cluster-left']")).toHaveLength(3)
    expect(document.body.querySelectorAll("[data-skin-trim-part='cluster-right']")).toHaveLength(3)
    for (const part of document.body.querySelectorAll('[data-skin-trim-part]')) {
      const root = part.closest("[data-skin-chrome='top-trim'], [data-skin-chrome='bottom-trim']")
      expect(root?.getAttribute('aria-hidden')).toBe('true')
      expect(part.getAttribute('data-skin-owner')).toBe('maid-atelier')
    }
    await fiber.dispose()
    expect(document.body.querySelectorAll('[data-skin-chrome]').length).toBe(0)
    expect(document.body.querySelectorAll('[data-skin-frame-part]')).toHaveLength(0)
    expect(document.body.querySelectorAll('[data-skin-trim-layer]')).toHaveLength(0)
    expect(document.body.querySelectorAll('[data-skin-trim-part]')).toHaveLength(0)
  })

  it('keeps the mascot independent and leaves the native vector brand intact', async () => {
    document.body.innerHTML = `
      <div data-pane="sidebar">
        <div>
          <div class="fixture_logoRow">
            <button class="fixture_brand"><svg aria-hidden="true"></svg></button>
          </div>
        </div>
      </div>
    `
    fiber = await mount()

    const mascots = document.querySelectorAll<HTMLImageElement>("[data-skin-chrome='sidebar-mascot']")
    expect(mascots).toHaveLength(2)
    expect([...mascots].map(mascot => mascot.dataset.maidCompanion)).toEqual(['day', 'night'])
    expect([...mascots].every(mascot => mascot.src.includes('data:image/webp;base64,'))).toBe(true)
    const corners = document.querySelector("[data-skin-chrome='sidebar-corners']")
    expect(corners?.querySelectorAll('[data-skin-corner]')).toHaveLength(4)
    const brand = document.querySelector("button[class*='brand'] > svg")
    expect(brand).not.toBeNull()
    expect(document.querySelector("[data-skin-chrome='brand-lockup']")).toBeNull()

    await fiber.dispose()
    expect(document.querySelector("[data-skin-owner='maid-atelier']")).toBeNull()
  })

  it('decorates a sidebar mounted after the skin', async () => {
    fiber = await mount()
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div data-pane="sidebar"><div><button class="fixture_brand"><svg></svg></button></div></div>',
    )
    await flushMutations()

    expect(document.querySelector("[data-skin-chrome='sidebar-mascot']")).not.toBeNull()
    expect(document.querySelector("button[class*='brand'] > svg")).not.toBeNull()
    expect(document.querySelector("[data-skin-chrome='brand-lockup']")).toBeNull()
  })

  it('anchors the public rc.6 settings slot to the real sidebar footer', async () => {
    document.body.innerHTML = `
      <div data-pane="sidebar">
        <div>
          <div class="fixture_footArea fixture_header"></div>
          <div class="fixture_footer">
            <div data-slot="sidebar.footer.action"></div>
            <div><div data-slot="sidebar.settings" style="display: contents">
              <button><div data-slot="settings.trigger">设置</div></button>
            </div></div>
          </div>
        </div>
      </div>
    `
    fiber = await mount()

    expect(document.querySelector('.fixture_header')?.hasAttribute('data-maid-sidebar-footer')).toBe(false)
    expect(document.querySelector('.fixture_footer')?.hasAttribute('data-maid-sidebar-footer')).toBe(true)

    await fiber.dispose()
    expect(document.querySelector('[data-maid-sidebar-footer]')).toBeNull()
  })

  it('marks the active workspace group and its session tree, then retracts every hook', async () => {
    document.body.innerHTML = `
      <div data-pane="sidebar">
        <div>
          <div role="tree">
            <div role="treeitem" aria-expanded="false"><span class="fixture_folder"></span></div>
            <div role="treeitem" aria-expanded="true"><span class="fixture_folder"></span></div>
            <div role="treeitem" aria-selected="true"><span class="fixture_title">Current</span></div>
            <div role="treeitem" aria-selected="false"><span class="fixture_title">Other</span></div>
          </div>
        </div>
      </div>
    `
    fiber = await mount()

    const workspace = document.querySelectorAll<HTMLElement>("[role='treeitem'][aria-expanded]")[1]!
    const group = workspace.parentElement!
    const sessions = group.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")
    expect(group.hasAttribute('data-maid-workspace-group')).toBe(true)
    expect(workspace.hasAttribute('data-maid-workspace-row')).toBe(true)
    expect(workspace.hasAttribute('data-maid-workspace-active')).toBe(true)
    expect([...sessions].every(session => session.hasAttribute('data-maid-session-row'))).toBe(true)
    expect(sessions[0]!.hasAttribute('data-maid-session-first')).toBe(true)
    expect(sessions[1]!.hasAttribute('data-maid-session-last')).toBe(true)

    sessions[0]!.setAttribute('aria-selected', 'false')
    await flushMutations()
    expect(workspace.hasAttribute('data-maid-workspace-active')).toBe(false)

    await fiber.dispose()
    expect(document.querySelector('[data-maid-workspace-group]')).toBeNull()
    expect(document.querySelector('[data-maid-workspace-row]')).toBeNull()
    expect(document.querySelector('[data-maid-session-row]')).toBeNull()
    expect(document.querySelector('[data-maid-session-first]')).toBeNull()
    expect(document.querySelector('[data-maid-session-last]')).toBeNull()
  })

  it('marks every Session row in the flat list without inventing a Workspace group', async () => {
    document.body.innerHTML = `
      <div data-pane="sidebar">
        <div class="fixture_flatList" role="tree" aria-label="Sessions">
          <div role="treeitem" aria-selected="true"><span class="fixture_title">Current</span></div>
          <div role="treeitem" aria-selected="false"><span class="fixture_title">Other</span></div>
        </div>
      </div>
    `
    fiber = await mount()

    const sessions = document.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")
    expect([...sessions].every(session => session.hasAttribute('data-maid-session-row'))).toBe(true)
    expect([...sessions].every(session => session.hasAttribute('data-maid-session-flat'))).toBe(true)
    expect(document.querySelector('[data-maid-workspace-row]')).toBeNull()

    await fiber.dispose()
    expect(document.querySelector('[data-maid-session-flat]')).toBeNull()
  })

  it('pins the skin title and restores the original on dispose', async () => {
    document.title = 'original'
    fiber = await mount()
    expect(document.title).not.toBe('original')
    await fiber.dispose()
    expect(document.title).toBe('original')
  })

  it('renders the scene on its own aspect-preserving stage without rewriting body backgrounds', async () => {
    document.body.style.setProperty('background-image', 'linear-gradient(red, blue)')
    document.body.style.setProperty('background-position', 'left bottom')
    document.body.style.setProperty('background-size', '17px 23px')

    fiber = await mount()

    const scene = document.querySelector<HTMLElement>("[data-skin-chrome='scene-stage']")
    expect(scene).not.toBeNull()
    expect(scene?.getAttribute('aria-hidden')).toBe('true')
    expect(scene?.style.backgroundImage).toContain('data:image/webp;base64,')
    expect(scene?.style.backgroundImage).not.toContain('linear-gradient')
    expect(document.body.style.backgroundImage).toBe('linear-gradient(red, blue)')
    expect(document.body.style.backgroundPosition).toBe('left bottom')
    expect(document.body.style.backgroundSize).toBe('17px 23px')
    const sceneRule = CSS.match(/\[data-skin-chrome='scene-stage'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(sceneRule).toContain('inset: var(--maid-titlebar-height, 0) auto 0 var(--maid-sidebar-width)')
    expect(sceneRule).toContain('right: 0')
    expect(sceneRule).toContain('width: auto')
    expect(sceneRule).toContain('background-size: cover')
    expect(sceneRule).not.toContain('width: 100vw')

    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='scene-stage']")).toBeNull()
    expect(document.body.style.backgroundImage).toBe('linear-gradient(red, blue)')
    expect(document.body.style.backgroundPosition).toBe('left bottom')
    expect(document.body.style.backgroundSize).toBe('17px 23px')
    document.body.style.removeProperty('background-image')
    document.body.style.removeProperty('background-position')
    document.body.style.removeProperty('background-size')
  })

  it('uses one approved scene plate without a duplicate character stage', async () => {
    fiber = await mount()
    expect(document.querySelector<HTMLElement>("[data-skin-chrome='scene-stage']")?.style.backgroundImage)
      .toContain('data:image/webp;base64,')
    expect(document.querySelector("[data-skin-chrome='character-stage']")).toBeNull()
    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='character-stage']")).toBeNull()
  }, 10_000)

  it('mounts the cover-cropped scene without a decorative viewport frame', async () => {
    fiber = await mount()
    const scene = document.querySelector<HTMLElement>("[data-skin-chrome='scene-stage']")
    expect(scene).not.toBeNull()
    expect(scene?.style.backgroundImage).toContain('data:image/webp;base64,')
    expect(document.querySelector("[data-skin-chrome='responsive-frame']")).toBeNull()
    expect(document.querySelectorAll('[data-skin-frame-part]')).toHaveLength(0)
  })

  it('installs and restores the complete ornament set', async () => {
    document.body.style.setProperty('--maid-new-session-art', 'legacy')
    document.body.style.setProperty('--maid-workspace-ribbon-art', 'legacy-ribbon')
    fiber = await mount()
    for (const property of ORNAMENT_PROPERTIES) {
      expect(document.body.style.getPropertyValue(property)).toContain(ornamentMediaType(property))
    }
    expect(document.querySelector("[data-skin-ornament='crest']")).toBeNull()
    await fiber.dispose()
    for (const property of ORNAMENT_PROPERTIES) {
      const expected = property === '--maid-new-session-art'
        ? 'legacy'
        : property === '--maid-workspace-ribbon-art' ? 'legacy-ribbon' : ''
      expect(document.body.style.getPropertyValue(property)).toBe(expected)
    }
  })

  it('overlaps the composer backing plate beneath the hollow raster frame', () => {
    const backingRule = [...CSS.matchAll(/\[data-composer-card\]::after\s*\{([^}]*)\}/g)]
      .map(match => match[1] ?? '')
      .find(rule => rule.includes("content: ''")) ?? ''
    expect(backingRule).toContain("content: ''")
    expect(backingRule).toContain('inset: 0;')
    expect(backingRule).not.toMatch(/inset:\s*0\s+-/)
    expect(backingRule).toContain('background: var(--maid-component-surface)')
    expect(backingRule).toContain('pointer-events: none')
  })

  it('recolors the native vector wordmark without replacing it with raster art', () => {
    expect(CSS).toMatch(/button\[class\*='brand'\]\s*\{[^}]*color: #f3e3c0/s)
    expect(CSS).toMatch(/button\[class\*='brand'\]\s*\{[^}]*--dsw-alias-label-primary-inverted: #10204d/s)
    expect(CSS).toMatch(/button\[class\*='brand'\] > svg\s*\{[^}]*width: min\(182px, 100%\)/s)
    expect(CSS).toMatch(/button\[class\*='brand'\] > svg > rect\s*\{[^}]*fill: #d7b46a/s)
    expect(CSS).toMatch(/button\[class\*='brand'\]::before\s*\{[^}]*var\(--maid-new-session-icon-art\)/s)
    expect(CSS).toMatch(/button\[class\*='brand'\]::before\s*\{[^}]*width: 30px[^}]*height: 30px/s)
    expect(CSS).not.toContain("[data-skin-chrome='brand-lockup']")
  })

  it('keeps question and todo copy paired with readable skin surfaces', () => {
    expect(CSS).toMatch(/\[data-question-key\]\s*\{[^}]*--dsw-alias-label-primary: #142044/s)
    expect(CSS).toMatch(/\[data-question-key\] > section\s*\{[^}]*rgba\(255, 254, 250, 0\.97\)/s)
    expect(CSS).toMatch(/\[data-question-key\] \[aria-checked='true'\]\s*\{[^}]*background: linear-gradient/s)
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[data-question-key\]\s*\{[^}]*--dsw-alias-label-primary: #edf1fa/s)
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[data-question-key\] > section\s*\{[^}]*rgba\(19, 35, 76, 0\.98\)/s)
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[data-question-key\] \[aria-checked='true'\]\s*\{[^}]*rgba\(74, 99, 163, 0\.5\)/s)
    expect(CSS).toMatch(/\[data-testid='todo-panel'\]\s*\{[^}]*--dsw-alias-label-primary: #172347/s)
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[data-testid='todo-panel'\]\s*\{[^}]*--dsw-alias-label-primary: #f4ead3/s)
  })

  it('defines one semantic component contract with distinct crystal-day and moon-tide values', () => {
    const dayRootRule = CSS.match(/body\[data-dsh-maid-atelier\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const nightRootRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-ds-dark-theme\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const requiredTokens = [
      '--maid-component-surface',
      '--maid-component-surface-strong',
      '--maid-component-surface-muted',
      '--maid-component-ink',
      '--maid-component-muted',
      '--maid-component-edge',
      '--maid-component-edge-soft',
      '--maid-component-accent',
      '--maid-component-hover',
      '--maid-component-active',
      '--maid-component-focus-inner',
      '--maid-component-focus-outer',
      '--maid-component-shadow',
      '--maid-workspace-ribbon-fill',
      '--maid-selected-session-fill',
      '--maid-assistant-fill',
      '--maid-user-fill',
      '--maid-overlay-fill',
    ]
    for (const token of requiredTokens) {
      expect(dayRootRule).toContain(token)
      expect(nightRootRule).toContain(token)
    }
    expect(dayRootRule).toContain('--maid-component-ink: #18345d')
    expect(dayRootRule).toContain('--maid-workspace-ribbon-fill: linear-gradient')
    expect(nightRootRule).toContain('--maid-component-ink: #f3eddf')
    expect(nightRootRule).toContain('--maid-workspace-ribbon-fill: linear-gradient')
  })

  it('applies the component contract to transcript, composer, menus, and dialogs', () => {
    expect(CSS).toMatch(/\[class\*='userRow'\] \[class\*='bubble'\]\s*\{[^}]*var\(--maid-user-fill\)/s)
    expect(CSS).toMatch(/\[data-chat-flow-kind='assistant-step'\] > \* > \* > div:not\(\[data-variant\]\)\s*\{[^}]*var\(--maid-assistant-fill\)/s)
    expect(CSS).toMatch(/\[data-variant='think'\] \[class\*='row'\]\s*\{[^}]*var\(--maid-component-surface-muted\)/s)
    expect(CSS).toMatch(/\[data-terminal\]\s*\{[^}]*var\(--maid-component-surface-strong\)/s)
    expect(CSS).toMatch(/\[data-composer-card\]::after\s*\{[^}]*var\(--maid-component-surface\)/s)
    expect(CSS).toMatch(/:is\(\[role='dialog'\], \[role='menu'\], \[data-radix-popper-content-wrapper\] > \*\)\s*\{[^}]*var\(--maid-overlay-fill\)/s)
    expect(CSS).toMatch(/:is\(button, \[role='button'\], \[role='menuitem'\], \[role='tab'\]\):focus-visible\s*\{[^}]*var\(--maid-component-focus-inner\)/s)
    expect(CSS).toMatch(/\[data-composer-card\]:has\(\[role='listbox'\]\)\s*\{[^}]*z-index: 12/s)
  })

  it('dresses context rows and lets the native settings modal own the viewport', () => {
    const turnTailRule = CSS.match(/\[data-chat-flow-kind='turn-tail'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(CSS).toMatch(/\[data-chat-flow-kind='context'\] \[role='button'\]\s*\{[^}]*var\(--maid-component-surface-muted\)/s)
    expect(turnTailRule).toContain('color: var(--maid-component-muted)')
    expect(turnTailRule).not.toContain('background:')
    expect(turnTailRule).not.toContain('border:')
    expect(CSS).toMatch(/:has\(\[role='dialog'\] \[data-slot='settings\.header'\]\) \[data-composer-seat\]\s*\{[^}]*visibility: hidden/s)
    expect(CSS).toMatch(/:has\(\[role='dialog'\] \[data-slot='settings\.header'\]\)[\s\S]*?\[data-skin-chrome='top-trim'\][\s\S]*?visibility: hidden/s)
    expect(CSS).toMatch(/:has\(\[role='dialog'\] \[data-slot='settings\.header'\]\)[\s\S]*?\[data-skin-chrome='theme-toggle'\][\s\S]*?visibility: hidden/s)
    expect(CSS).toMatch(/:has\(\[role='dialog'\] \[data-slot='settings\.header'\]\)[\s\S]*?header:has\(\[role='tablist'\]\)\s*\{[^}]*visibility: hidden/s)
  })

  it('aligns docked composer controls and paints context usage gold over blue', () => {
    expect(CSS).toMatch(/\[data-phase='active'\] \[data-composer-card\] > \[class\*='row'\]\s*\{[^}]*padding: 2px 14px 10px/s)
    expect(CSS).toMatch(/button\[class\*='add'\][\s\S]*?width: 38px[\s\S]*?border-radius: 50%/)
    expect(CSS).toMatch(/\[class\*='modes'\] button\[class\*='trigger'\]:has\(\[class\*='triggerIcon'\]\)/)
    expect(CSS).toMatch(/button\[aria-haspopup='dialog'\] \[class\*='track'\]\s*\{[^}]*stroke: #4d6bab/s)
    expect(CSS).toMatch(/button\[aria-haspopup='dialog'\] \[class\*='fill'\]\s*\{[^}]*stroke: #d3a957/s)
    expect(CSS).toMatch(/\[role='dialog'\] \[class\*='header'\][\s\S]*?color: #172347/)
    expect(CSS).toMatch(/\[class\*='triggerEffort'\]\s*\{[^}]*color: #a77c36/s)
  })

  it('nine-slices the composer frame independently from its top crown', () => {
    const frameRule = CSS.match(/\[data-composer-card\]::before\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(frameRule).toContain('inset: 0')
    expect(frameRule).toContain('z-index: 1')
    expect(frameRule).toContain('border-width: 28px 38px')
    expect(frameRule).toContain('border-image-source: var(--maid-composer-frame-art)')
    expect(frameRule).toContain('border-image-slice: 230 330')
    expect(frameRule).toContain('border-image-width: 28px 38px')
    expect(frameRule).toContain('border-image-outset: 15px 6px 16px')
    expect(frameRule).toContain('border-image-repeat: stretch')
    expect(frameRule).not.toContain('var(--maid-composer-rail-art)')
    expect(frameRule).toContain('pointer-events: none')
  })

  it('projects the visible composer rails onto the native card edge', () => {
    const frameRule = CSS.match(/\[data-composer-card\]::before\s*\{([^}]*)\}/s)?.[1] ?? ''
    const readNumbers = (property: string): number[] => {
      const value = frameRule.match(new RegExp(`${property}:\\s*([^;]+)`))?.[1] ?? ''
      return [...value.matchAll(/-?[\d.]+/g)].map(match => Number(match[0]))
    }
    const expandBox = (values: number[]): [number, number, number, number] => {
      if (values.length === 1) return [values[0]!, values[0]!, values[0]!, values[0]!]
      if (values.length === 2) return [values[0]!, values[1]!, values[0]!, values[1]!]
      if (values.length === 3) return [values[0]!, values[1]!, values[2]!, values[1]!]
      if (values.length === 4) return values as [number, number, number, number]
      throw new Error('Expected a one-to-four-value CSS box declaration')
    }

    const [borderTop, borderRight, borderBottom, borderLeft] = expandBox(readNumbers('border-width'))
    const [sliceTop, sliceRight, sliceBottom, sliceLeft] = expandBox(readNumbers('border-image-slice'))
    const [outsetTop, outsetRight, outsetBottom, outsetLeft] = expandBox(readNumbers('border-image-outset'))
    const sources = [
      { width: 2062, height: 763, top: 116, right: 2018, bottom: 630, left: 43.5 },
      { width: 2076, height: 758, top: 125, right: 2021.5, bottom: 627, left: 53.5 },
    ]

    for (const source of sources) {
      const offsets = [
        source.top / sliceTop * borderTop - outsetTop,
        outsetRight - (source.width - source.right) / sliceRight * borderRight,
        outsetBottom - (source.height - source.bottom) / sliceBottom * borderBottom,
        source.left / sliceLeft * borderLeft - outsetLeft,
      ]
      expect(Math.max(...offsets.map(Math.abs))).toBeLessThanOrEqual(1.3)
    }
  })

  it('aligns each composer crown rail with the top rim and keeps it out of the writing line', () => {
    const dayRootRule = CSS.match(/body\[data-dsh-maid-atelier\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const nightRootRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-ds-dark-theme\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const crownRule = CSS.match(
      /\[data-composer-card\] > \[class\*='overlayAnchor'\]::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(dayRootRule).toContain('--maid-composer-crown-top: -122px')
    expect(dayRootRule).toContain('--maid-composer-crown-clearance: 60px')
    expect(nightRootRule).toContain('--maid-composer-crown-top: -128px')
    expect(nightRootRule).toContain('--maid-composer-crown-clearance: 68px')
    expect(CSS).toMatch(/\[data-composer-card\]\s*\{[^}]*padding-top: var\(--maid-composer-crown-clearance\)/s)
    expect(crownRule).toContain('top: var(--maid-composer-crown-top)')
    expect(crownRule).toContain('background: var(--maid-composer-rail-art) center / contain no-repeat')
    expect(crownRule).toContain('pointer-events: none')
  })

  it('uses the detailed material frame for assistant output and a compact bubble edge for user input', () => {
    const userRule = CSS.match(/\[class\*='userRow'\] \[class\*='bubble'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const assistantRule = CSS.match(
      /\[data-chat-flow-kind='assistant-step'\] > \* > \* > div:not\(\[data-variant\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const assistantFrameRule = CSS.match(
      /\[data-chat-flow-kind='assistant-step'\] > \* > \* > div:not\(\[data-variant\]\)::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(assistantRule).toContain('position: relative')
    expect(assistantRule).toContain('border: 1px solid var(--maid-component-edge)')
    expect(assistantRule).not.toContain('border: 34px solid transparent')
    expect(assistantRule).not.toContain('border-image-source')
    expect(assistantFrameRule).toContain("content: ''")
    expect(assistantFrameRule).toContain('border-image-source: var(--maid-content-frame-art)')
    expect(assistantFrameRule).toContain('border-image-repeat: stretch')
    expect(assistantFrameRule).toContain('pointer-events: none')
    expect(userRule).toContain('border: 1px solid var(--maid-component-edge)')
    expect(userRule).not.toContain('border-image')
    expect(CSS).toMatch(/\[class\*='userRow'\] \[class\*='bubble'\]::after\s*\{[^}]*var\(--maid-new-session-icon-art\)/s)
  })

  it('three-slices the new-session plate without stretching its ornamental ends', () => {
    const plateRule = CSS.match(/button\[class\*='newSession'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const hoverRule = CSS.match(
      /button\[class\*='newSession'\]:hover\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const collapsedRule = [...CSS.matchAll(/button\[class\*='newSession'\]\s*\{([^}]*)\}/g)]
      .map((match) => match[1] ?? '')
      .find((rule) => rule.includes('border-image: none')) ?? ''
    const narrowRule = [...CSS.matchAll(/button\[class\*='newSession'\]\s*\{([^}]*)\}/g)]
      .map((match) => match[1] ?? '')
      .find((rule) => rule.includes('border-image-width: 0 32px')) ?? ''
    expect(plateRule).toContain('border-image-source: var(--maid-new-session-art)')
    expect(plateRule).toContain('border-image-slice: 0 150 0 150 fill')
    expect(plateRule).toContain('border-image-width: 0 30px')
    expect(plateRule).toContain('border-radius: 18px')
    expect(plateRule).toContain('border-image-repeat: stretch')
    expect(CSS).toMatch(/\[data-ds-dark-theme\] button\[class\*='newSession'\]\s*\{[^}]*color: #f3eddf/s)
    expect(plateRule).not.toContain('100% 100%')
    expect(hoverRule).not.toContain('background:')
    expect(narrowRule).toContain('padding-inline: 0')
    expect(narrowRule).toContain('border-width: 0 32px')
    expect(collapsedRule).toContain('border-image: none')
  })

  it('uses dedicated circular controls on the collapsed sidebar rail', () => {
    const toggleRule = CSS.match(
      /\[class\*='logoRow'\] \[class\*='toggle'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const collapsedSessionIconRule = [...CSS.matchAll(
      /button\[class\*='newSession'\] svg\s*\{([^}]*)\}/g,
    )].map(match => match[1] ?? '').find(rule => rule.includes('#efd7a1')) ?? ''
    const collapsedFootRule = [...CSS.matchAll(
      /\[data-slot='sidebar\.settings'\][\s\S]*?> :is\(button, \[role='button'\]\)\s*\{([^}]*)\}/g,
    )].map(match => match[1] ?? '').find(rule => rule.includes('border-image: none')) ?? ''
    const collapsedSessionRule = [...CSS.matchAll(/button\[class\*='newSession'\]\s*\{([^}]*)\}/g)]
      .map(match => match[1] ?? '').find(rule => rule.includes('border-image: none')) ?? ''
    const collapsedFootAreaRule = [...CSS.matchAll(/\[data-maid-sidebar-footer\]\s*\{([^}]*)\}/g)]
      .map(match => match[1] ?? '').find(rule => rule.includes('display: flex')) ?? ''
    const sharedRailRule = CSS.match(
      /:is\(\s*\[class\*='logoRow'\] \[class\*='toggle'\],[\s\S]*?\[data-slot='sidebar\.settings'\] > :is\(button, \[role='button'\]\)\s*\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const sharedRailHoverRule = CSS.match(
      /:is\(\s*\[class\*='logoRow'\] \[class\*='toggle'\],[\s\S]*?\[data-slot='sidebar\.settings'\] > :is\(button, \[role='button'\]\)\s*\):is\(:hover, :focus-visible\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(toggleRule).toContain('border-radius: 50%')
    expect(sharedRailRule).toContain('width: var(--maid-rail-control-size)')
    expect(sharedRailRule).toContain('height: var(--maid-rail-control-size)')
    expect(sharedRailRule).toContain('flex: 0 0 var(--maid-rail-control-size)')
    expect(sharedRailRule).toContain('border-image: none')
    expect(sharedRailRule).toContain('overflow: visible')
    expect(sharedRailHoverRule).toContain('transform: none')
    expect(collapsedSessionIconRule).toContain('color: #efd7a1')
    expect(collapsedSessionRule).toContain('align-self: center')
    expect(collapsedSessionRule).toContain('margin: 6px 0 10px')
    expect(collapsedFootAreaRule).toContain('justify-content: center')
    expect(collapsedFootRule).toContain('width: 38px')
    expect(collapsedFootRule).toContain('margin: 0')
    expect(collapsedFootRule).toContain('border-radius: 50%')
    expect(CSS).toMatch(/\[data-maid-sidebar-size='rail'\] \[class\*='sectionHeader'\]\s*\{[^}]*justify-content: center/)
    expect(CSS).toMatch(/\[class\*='search'\]:has\(> \[class\*='searchButton'\]\)\s*\{[^}]*justify-content: center/)
    expect(CSS).toMatch(/\[class\*='regionArea'\]\)\s*\{[^}]*overflow: visible/)
  })

  it('keeps settings content independent from collapsed sidebar icon chrome', () => {
    const railIconSelectors = [...CSS.matchAll(
      /body\[data-dsh-maid-atelier\]\[data-maid-sidebar-size='rail'\][^{]+:is\(\[class\*='iconButton'\], \[class\*='searchButton'\]\)[^{]+\{/g,
    )].map(match => match[0] ?? '')
    const centeredSettingsContentRule = CSS.match(
      /:not\(\[data-maid-sidebar-size='rail'\]\)[\s\S]*?\[data-slot='sidebar\.settings'\][\s\S]*?> :is\(button, \[role='button'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const centeredSettingsLabelRule = CSS.match(
      /\[data-slot='settings\.trigger'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(railIconSelectors.length).toBeGreaterThan(0)
    expect(railIconSelectors.every(selector => selector.includes(":not([role='dialog'] *)"))).toBe(true)
    // The icon and label travel as one pair: a fixed gap binds them (like the
    // New Session button) and the pair stays centered, so resizing the sidebar
    // never stretches the space between the gear and the text.
    expect(centeredSettingsContentRule).toContain('position: relative')
    expect(centeredSettingsContentRule).toContain('flex: 1 1 auto')
    expect(centeredSettingsContentRule).toContain('justify-content: center')
    expect(centeredSettingsContentRule).toContain('gap: 8px')
    expect(centeredSettingsLabelRule).not.toContain('position: absolute')
    expect(centeredSettingsLabelRule).not.toContain('left: 50%')
    expect(centeredSettingsLabelRule).toContain('line-height: 1')
  })

  it('hides the duplicated title-bar menu button in frameless surfaces', () => {
    const titlebarMenuRule = CSS.match(
      /\[class\*='titlebar'\] > \[class\*='button'\]:first-of-type\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(titlebarMenuRule).toContain('display: none')
    expect(CSS).toMatch(/\[class\*='titlebar'\] > \[class\*='button'\]:first-of-type/)
  })

  it('places the whale-free wordmark at the left of the frameless title bar', async () => {
    fiber = await mount()
    document.body.insertAdjacentHTML('beforeend', '<div class="fixture_titlebar"></div>')
    await flushMutations()
    const titlebar = document.querySelector<HTMLElement>("[class*='titlebar']")
    const brand = titlebar?.querySelector<HTMLElement>("[data-skin-chrome='titlebar-brand']")
    expect(brand).not.toBeNull()
    const svg = brand?.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe('26 4.2 155.6 17.6')
    expect(svg?.innerHTML ?? '').toContain('maid-titlebar-brand-clip')
    expect(svg?.innerHTML ?? '').not.toContain('whale-clip')
    expect(svg?.innerHTML ?? '').not.toContain('M23.0584')
    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='titlebar-brand']")).toBeNull()
  })

  it('styles the title-bar wordmark centered on the window, always visible', () => {
    expect(CSS).toMatch(/\[data-skin-chrome='titlebar-brand'\]\s*\{[^}]*left: 50%/s)
    expect(CSS).toMatch(/\[data-skin-chrome='titlebar-brand'\]\s*\{[^}]*transform: translate\(-50%, -50%\)/s)
    expect(CSS).toMatch(/\[data-skin-chrome='titlebar-brand'\]\s*\{[^}]*pointer-events: none/s)
    expect(CSS).toMatch(/\[data-skin-chrome='titlebar-brand'\] svg\s*\{[^}]*height: 18px/s)
    // The wordmark must not hide with the rail: it is decorative and centered.
    expect(CSS).not.toMatch(/\[data-maid-sidebar-size='rail'\]\s*\[data-skin-chrome='titlebar-brand'\]\s*\{[^}]*display: none/s)
  })

  it('re-asserts the frameless frame rows through CSSOM env(), bypassing the module pipeline', async () => {
    fiber = await mount()
    const sheet = document.querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")
    const cssText = [...(sheet?.sheet?.cssRules ?? [])].map(rule => rule.cssText).join(' ')
    // jsdom's CSS parser drops the env() declaration body (the real browser
    // keeps `grid-template-rows: env(titlebar-area-height, 40px) 1fr`), so
    // assert the repaired selectors and the handle boundary instead.
    expect(cssText).toContain('[data-wco]')
    expect(cssText).toContain('[data-desktop]')
    expect(cssText).toContain('handle"]')
    expect(cssText).toContain('top: var(--maid-titlebar-height, 0px)')
  })

  it('starts the top curtain below the frameless title-bar row', () => {
    // The offset height must come from the runtime variable, never from env():
    // the CSS-modules pipeline rewrites env() identifiers, so a hardcoded
    // env() rule would silently fall back to 0 and paint over the title bar.
    const trimOffsetRule = CSS.match(
      /\[data-skin-chrome='top-trim'\]\s*\{\s*top: var\(--maid-titlebar-height, 0px\)/s,
    )?.[1] ?? ''
    expect(trimOffsetRule).not.toBeNull()
    expect(CSS).not.toMatch(/env\(titlebar-area-height/)
  })

  it('falls back to zero title-bar height when no sidebar column is laid out', async () => {
    fiber = await mount()
    const sheet = document.querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")
    expect(sheet?.sheet?.cssRules[0]?.cssText ?? '').toMatch(/--maid-titlebar-height\s*:\s*0px/)
    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='sidebar-width-rule']")).toBeNull()
  })

  it('mirrors the sidebar column top as the curtain offset when a column exists', async () => {
    document.body.innerHTML = `
      <div data-pane="sidebar">
        <div class="fixture_logoRow"><button class="fixture_brand"><svg></svg></button></div>
      </div>
    `
    const column = document.querySelector<HTMLElement>("[data-pane='sidebar']")!
    // jsdom has no layout; pretend the column sits 40px below the viewport top.
    vi.spyOn(column, 'getBoundingClientRect').mockReturnValue({
      top: 40, left: 0, right: 280, bottom: 760, width: 280, height: 720,
      x: 0, y: 40, toJSON: () => ({}),
    })
    fiber = await mount()
    const sheet = document.querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")
    expect(sheet?.sheet?.cssRules[0]?.cssText ?? '').toContain('--maid-titlebar-height: 40px')
    await fiber.dispose()
  })

  it('dresses the frameless title bar with the sidebar navy gradient', () => {
    const titlebarRule = CSS.match(/\[class\*='titlebar'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(titlebarRule).toContain('linear-gradient')
    // Vertical gradient, deepest at the bottom where it meets the sidebar and
    // the trim band, lightening toward the top edge.
    expect(titlebarRule).toContain('to top')
    expect(titlebarRule).toContain('rgba(197, 164, 104, 0.42)')
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[class\*='titlebar'\]\s*\{[^}]*to top/s)
    expect(CSS).toMatch(/\[class\*='titlebar'\] \[class\*='button'\]\s*\{[^}]*color: #d9bd83/s)
  })

  it('keeps delayed sidebar tooltips out of the rail flex layout', () => {
    const sidebarLayerSelector = CSS.match(
      /body\[data-dsh-maid-atelier\] :is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) > div > :not\(([\s\S]*?)\)\s*\{/,
    )?.[1] ?? ''
    expect(sidebarLayerSelector).toContain("[role='tooltip']")
  })

  it('paints the sidebar double rule without shrinking the collapsed rail', () => {
    const sidebarRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(sidebarRule).toContain('border-right: 0')
    expect(sidebarRule).toContain('inset -1px 0 rgba(255, 245, 215, 0.82)')
    expect(sidebarRule).toContain('inset -3px 0 rgba(226, 207, 166, 0.72)')
  })

  it('restores the large hero text floor without fixing the workspace height', () => {
    const mirrorRule = CSS.match(/\[data-input-mirror\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const heroMirrorRule = CSS.match(
      /\[data-phase='hero'\] \[data-input-mirror\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(mirrorRule).toContain('min-height: 0')
    expect(heroMirrorRule).toContain('min-height: clamp(72px, 9vh, 118px)')
    expect(mirrorRule).toContain('transition: min-height 520ms')
    expect(CSS).not.toMatch(/\[data-phase='hero'\] \[data-composer-card\][^{]*\{[^}]*min-height/s)
  })

  it('scales and translucently backs the landing composer through official width hooks', () => {
    const heroRule = CSS.match(/\[data-phase='hero'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const heroCardRule = CSS.match(
      /\[data-phase='hero'\] \[data-composer-card\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const heroBackingRule = CSS.match(
      /\[data-phase='hero'\]\s*\[data-composer-card\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(heroRule).toContain('--dsh-chat-content-width: clamp(560px, 41vw, 740px)')
    expect(heroRule).toContain('--dsh-composer-card-max-width')
    expect(heroCardRule).toContain('rgba(255, 254, 250, 0.54)')
    expect(heroCardRule).toContain('backdrop-filter: blur(2.5px)')
    expect(heroBackingRule).toContain('rgba(248, 250, 255, 0.2)')
  })

  it('keeps hero workspace, permission, and model controls in the official composer flow', () => {
    const permissionRule = CSS.match(
      /\[class\*='modes'\] button\[class\*='trigger'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const modelRule = CSS.match(
      /\[class\*='trailing'\] button\[class\*='trigger'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(CSS).not.toMatch(
      /\[data-phase='hero'\]\s*:has\(> \[data-composer-card\]\)\s*\{[^}]*transform/s,
    )
    expect(permissionRule).toContain('justify-content: center')
    expect(permissionRule).toContain('gap: 0')
    expect(modelRule).toContain('width: auto')
    expect(modelRule).toContain('max-width: 220px')
    expect(modelRule).toContain('padding: 0 4px 0 8px')
    expect(CSS).not.toMatch(
      /\[class\*='trailing'\][\s\S]*?:is\(\[class\*='triggerLabel'\], \[class\*='triggerEffort'\]\)\s*\{[^}]*display: none/s,
    )
  })

  it('marks the native hero selector row as a retractable composer safe zone', async () => {
    document.body.innerHTML = `
      <div data-phase="hero">
        <div class="fixture_heroWorkspaceRow">
          <button aria-label="选择工作区">AI_Demo</button>
          <button>标准模式</button>
        </div>
        <div data-composer-card></div>
      </div>
    `

    const row = document.querySelector<HTMLElement>("[class*='heroWorkspaceRow']")!
    fiber = await mount()
    expect(row.hasAttribute('data-maid-composer-selector-row')).toBe(true)

    await fiber.dispose()
    expect(row.hasAttribute('data-maid-composer-selector-row')).toBe(false)
  })

  it('rebuilds the hero logo surround, caption rule, and embedded circular controls', () => {
    const headlineRule = CSS.match(
      /\[class\*='headline'\]:has\(> \[class\*='fish'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const medallionRule = CSS.match(
      /\[class\*='headline'\]:has\(> \[class\*='fish'\]\) > \[class\*='fish'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const captionRule = CSS.match(
      /\[class\*='headline'\]:has\(> \[class\*='fish'\]\)::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const addRule = CSS.match(
      /\[data-composer-card\] button\[class\*='add'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const sendRule = CSS.match(
      /\[data-composer-card\] button\[class\*='primary'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const titleRule = CSS.match(
      /\[data-phase='hero'\] \[class\*='headlineText'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const previewRule = CSS.match(
      /\[data-phase='hero'\] \[class\*='previewBadge'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(headlineRule).toContain('grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)')
    expect(titleRule).toContain('grid-column: 2')
    expect(previewRule).toContain('grid-column: 3')
    expect(previewRule).toContain('justify-self: start')
    expect(medallionRule).toContain('width: 70px')
    expect(medallionRule).toContain('outline: 1px solid')
    expect(captionRule).toContain('linear-gradient(45deg')
    expect(addRule).toContain('width: 42px')
    expect(addRule).toContain('border-radius: 50%')
    expect(sendRule).toContain('width: 44px')
    expect(sendRule).toContain('linear-gradient(145deg, #6079b5, #294587)')
  })

  it('keeps the dark hero title and preview badge legible over the night palace', () => {
    const titleRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-ds-dark-theme\]\s*\[data-phase='hero'\] \[class\*='headlineText'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const badgeRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-ds-dark-theme\]\s*\[data-phase='hero'\] \[class\*='previewBadge'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(titleRule).toContain('color: #fffaf0')
    expect(titleRule).toContain('-webkit-text-stroke: 0.35px')
    expect(titleRule).toContain('0 3px 7px rgba(0, 0, 0, 0.86)')
    expect(badgeRule).toContain('color: #f0dfba')
    expect(badgeRule).toContain('rgba(7, 18, 52, 0.58)')
  })

  it('keeps the scene artwork behind the real application without a duplicate character layer', () => {
    expect(CSS).not.toContain("[data-skin-chrome='character-stage']")
    expect(CSS).not.toContain('[data-maid-character]')
  })

  it('coordinates composer docking and rising with the curtain duration', () => {
    expect(CSS).toContain("data-maid-composer-motion='dock'")
    expect(CSS).toContain("data-maid-composer-motion='rise'")
    expect(CSS).toContain('animation: maidAtelierComposerDock 520ms')
    expect(CSS).toContain('animation: maidAtelierComposerRise 520ms')
    expect(CSS).toContain('@keyframes maidAtelierComposerDock')
    expect(CSS).toContain('@keyframes maidAtelierComposerRise')
    expect(CSS).toMatch(/\[data-maid-composer-motion\][^{]*\{[^}]*will-change: transform, opacity/s)
  })

  it('styles assistant Markdown blocks through the stable flow-kind hook', () => {
    const bubbleRule = CSS.match(
      /\[data-chat-flow-kind='assistant-step'\] > \* > \* > div:not\(\[data-variant\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(bubbleRule).toContain('max-width: min(680px, 96%)')
    expect(bubbleRule).toContain('padding: 14px 18px')
    expect(bubbleRule).toContain('border-radius: 18px 18px 18px 7px')
    expect(bubbleRule).not.toContain('backdrop-filter')
    expect(CSS).toContain("[data-variant='think']")
  })

  it('marks only live hero and workspace phase changes for composer motion', async () => {
    document.body.innerHTML = '<div data-phase="hero"></div>'
    fiber = await mount()
    expect(document.body.hasAttribute('data-maid-composer-motion')).toBe(false)

    document.querySelector<HTMLElement>('[data-phase]')!.dataset.phase = 'active'
    await flushMutations()
    expect(document.body.dataset.maidComposerMotion).toBe('dock')

    document.querySelector<HTMLElement>('[data-phase]')!.dataset.phase = 'hero'
    await flushMutations()
    expect(document.body.dataset.maidComposerMotion).toBe('rise')
    await fiber.dispose()
    expect(document.body.hasAttribute('data-maid-composer-motion')).toBe(false)
  })

  it('preserves mirror-driven composer sizing and clears the statistics dock', () => {
    const cardRule = CSS.match(/\[data-composer-card\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const textareaRule = CSS.match(/\[data-composer-card\] textarea\s*\{([^}]*)\}/s)?.[1] ?? ''
    const footerClearanceRule = CSS.match(
      /\[data-phase='active'\] \[data-composer-card\]:has\(\+ \*\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(cardRule).toContain('min-height: 0')
    expect(cardRule).not.toContain('min-height: 210px')
    expect(textareaRule).not.toContain('min-height: 112px')
    expect(footerClearanceRule).toContain('margin-block-end: 12px')
  })

  it('gives inspect-only overlay views the full canvas without the composer seat', () => {
    const inspectRule = CSS.match(
      /\[data-phase='active'\]\s*\[data-conversation-scroll\]:not\(:has\(\[data-chat-flow\]\)\)\s*> \[data-composer-seat\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(inspectRule).toContain('display: none')
  })

  it('lets the lower sidebar swag own the bottom boundary without a rectangular tint seam', () => {
    const innerFrameRule = CSS.match(/\:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) > div::before\s*\{([^}]*)\}/s)?.[1] ?? ''
    const fadeRule = CSS.match(/\:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) \[class\*='fade'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(innerFrameRule).toContain('inset: 9px 7px 0')
    expect(innerFrameRule).toContain('border: 0')
    expect(innerFrameRule).not.toContain('box-shadow')
    expect(fadeRule).toContain('background: none')
  })

  it('keeps internal tool-card headers out of the navy page-header treatment', () => {
    const pageHeaderRule = CSS.match(
      /:is\(\[data-pane='conversation'\], \[class\*='centerCol'\]\) header\[class\*='header'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const terminalRule = CSS.match(/\[data-terminal\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const darkTerminalRule = CSS.match(
      /\[data-ds-dark-theme\] \[data-terminal\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(pageHeaderRule).toContain('color: #f8f3e8')
    expect(CSS).not.toMatch(
      /:is\(\[data-pane='conversation'\], \[class\*='centerCol'\]\) \[class\*='header'\]\s*\{/,
    )
    expect(terminalRule).toContain('--dsw-alias-markdown-code-block: rgba(249, 250, 253, 0.97)')
    expect(terminalRule).toContain('--dsw-alias-label-primary: #172347')
    expect(terminalRule).toContain('text-shadow: none')
    expect(darkTerminalRule).toContain('--dsw-alias-markdown-code-block: rgba(10, 20, 48, 0.97)')
    expect(darkTerminalRule).toContain('--dsw-alias-label-primary: #edf1fa')
  })

  it('fills the lower sidebar shelf with its dedicated tide ribbon', () => {
    const sidebarInnerRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) > div\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const footRule = CSS.match(/\[data-maid-sidebar-footer\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const swagRule = CSS.match(/\[data-maid-sidebar-footer\]::before\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(sidebarInnerRule).not.toContain('container-type')
    expect(footRule).toContain('box-sizing: border-box')
    expect(footRule).toContain('position: relative')
    expect(footRule).toContain('flex: 0 0 calc(var(--maid-sidebar-swag-height) + 56px)')
    expect(footRule).toContain('padding: calc(var(--maid-sidebar-swag-height) - 6px) 18px 12px')
    expect(swagRule).toContain('height: var(--maid-sidebar-swag-height)')
    expect(swagRule).toContain(
      'background: var(--maid-sidebar-footer-art) center top / var(--maid-sidebar-width) var(--maid-sidebar-swag-height) no-repeat',
    )
  })

  it('keeps generated corner ornaments on a soft rounded sidebar frame', () => {
    const frameRule = CSS.match(
      /\[data-skin-chrome='sidebar-corners'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const cornerRule = CSS.match(
      /\[data-skin-chrome='sidebar-corners'\] > \[data-skin-corner\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(CSS).toContain('--maid-sidebar-corner-art')
    expect(frameRule).toContain('inset: 4px')
    expect(frameRule).toContain('border: 1px solid var(--maid-component-edge-soft)')
    expect(frameRule).toContain('border-radius: 18px')
    expect(frameRule).not.toContain('linear-gradient')
    expect(cornerRule).toContain('width: 68px')
    expect(cornerRule).toContain('height: 68px')
    expect(cornerRule).toContain('background: var(--maid-sidebar-corner-art) center / contain no-repeat')
    expect(CSS).toContain("[data-skin-corner='bottom-left']")
    expect(CSS).toContain('transform: scale(-1)')
  })

  it('styles the workspace heading, search field, and settings surround in antique gold', () => {
    const headingRule = CSS.match(/\[class\*='sectionHeader'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const searchRule = CSS.match(
      /\[class\*='search'\]\[class\*='searchExpanded'\]:has\(> input\[class\*='searchInput'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const settingsRule = CSS.match(
      /\[data-slot='sidebar\.settings'\]\s*> :is\(button, \[role='button'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(headingRule).toContain('color: #d9bd83')
    expect(searchRule).toContain('border: 1px solid rgba(225, 191, 124, 0.72)')
    expect(searchRule).toContain('--dsh-search-input-fill: transparent')
    expect(CSS).not.toMatch(/\[class\*='search'\]:has\(> input\[class\*='searchInput'\]\)\s*\{/)
    expect(settingsRule).toContain('min-height: 50px')
    expect(settingsRule).toContain('border-image-source: var(--maid-settings-frame-art)')
    expect(settingsRule).toContain('border-image-slice: 0 150 0 150 fill')
    expect(settingsRule).toContain('border-image-width: 0 30px')
  })

  it('gives the expanded sidebar search enough height to clear the new-session ornament', () => {
    const expandedHeaderRule = CSS.match(
      /\[class\*='sectionHeader'\]:has\(\[class\*='searchSlot'\]\[class\*='searchSlotExpanded'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(expandedHeaderRule).toContain('height: 54px')
    expect(expandedHeaderRule).toContain('min-height: 54px')
    expect(expandedHeaderRule).toContain('overflow: visible')
  })

  it('lets the official settings mask blur every skin-owned layer', () => {
    const sidebarRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const sidebarInnerRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) > div\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const portalRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\)\s*> div > \[data-maid-sidebar-footer\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const topTrimRule = CSS.match(/\[data-skin-chrome='top-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const bottomTrimRule = CSS.match(/\[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(sidebarRule).toContain('z-index: auto')
    expect(sidebarInnerRule).toContain('isolation: auto')
    expect(sidebarInnerRule).not.toContain('container-type')
    expect(portalRule).toContain('z-index: auto')
    expect(topTrimRule).toContain('z-index: 20')
    expect(topTrimRule).toContain('display: none')
    expect(bottomTrimRule).toContain('z-index: 19')
    expect(bottomTrimRule).toContain('display: none')
  })

  it('renders the active workspace as a crested ribbon with a connected session tree', () => {
    const ribbonShapeRule = CSS.match(/\[data-maid-workspace-active\]::before\s*\{([^}]*)\}/s)?.[1] ?? ''
    const shieldRule = CSS.match(
      /\[data-maid-workspace-row\] > \[class\*='folder'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const selectedSessionRule = CSS.match(
      /\[data-maid-session-row\]\[aria-selected='true'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const sessionBranchRule = CSS.match(
      /\[data-maid-session-row\]::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const selectedSessionPlaqueRule = CSS.match(
      /\[data-maid-session-row\]:not\(\[data-maid-session-flat\]\)\[aria-selected='true'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(CSS).toContain('--maid-workspace-crest-art')
    expect(CSS).toContain('--maid-workspace-ribbon-art')
    expect(shieldRule).toContain('background: var(--maid-workspace-crest-art)')
    expect(shieldRule).not.toContain('clip-path')
    expect(ribbonShapeRule).toContain('border-image-source: var(--maid-workspace-ribbon-art)')
    expect(ribbonShapeRule).toContain('border-image-slice: 0 150 0 150 fill')
    expect(ribbonShapeRule).toContain('border-image-width: 0 30px')
    expect(ribbonShapeRule).toContain('border-image-repeat: stretch')
    expect(ribbonShapeRule).toContain('inset: -2px 2px -2px -8px')
    expect(ribbonShapeRule).toContain('animation: maidAtelierWorkspaceRibbonEnter 420ms')
    expect(ribbonShapeRule).not.toContain('background-size')
    expect(ribbonShapeRule).not.toContain('clip-path')
    expect(CSS).toContain('@keyframes maidAtelierWorkspaceRibbonEnter')
    expect(CSS).toMatch(/@keyframes maidAtelierWorkspaceRibbonEnter[\s\S]*?opacity: 0[\s\S]*?translateX\(-8px\)/)
    expect(CSS).toContain('@keyframes maidAtelierWorkspaceRibbonContentEnter')
    expect(selectedSessionRule).toContain('background: transparent')
    expect(selectedSessionRule).toContain('color: #fff8e8')
    expect(selectedSessionPlaqueRule).toContain('inset: 0 0 0 18px')
    expect(selectedSessionPlaqueRule).toContain('border-radius: 12px')
    expect(selectedSessionPlaqueRule).toContain('rgba(226, 190, 112, 0.72)')
    expect(selectedSessionPlaqueRule).toContain('rgba(82, 111, 184, 0.74)')
    expect(sessionBranchRule).toContain('radial-gradient')
    expect(sessionBranchRule).not.toContain('repeating-linear-gradient')
    expect(sessionBranchRule).toContain('left: 8px')
    expect(sessionBranchRule).toContain('width: 10px')
    expect(CSS).toMatch(/\[data-maid-session-last\]::before\s*\{[^}]*transparent 52%/s)
  })

  it('renders the selected flat-list Session as a complete gold-edged plaque', () => {
    const flatRule = CSS.match(/\[data-maid-session-flat\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const selectedRule = CSS.match(
      /\[data-maid-session-flat\]\[aria-selected='true'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const accentRule = CSS.match(
      /\[data-maid-session-flat\]\[aria-selected='true'\]::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(flatRule).toContain('box-sizing: border-box')
    expect(flatRule).toContain('border-radius: 7px')
    expect(selectedRule).toContain('rgba(226, 190, 112, 0.72)')
    expect(selectedRule).toContain('rgba(82, 111, 184, 0.74)')
    expect(accentRule).toContain('linear-gradient(#fff0c5, #d4a951)')
    expect(accentRule).toContain('inset: 7px auto 7px 5px')
  })

  it('skins the official running StateDot as a recognizable atelier jewel chase', () => {
    const runningDotRule = CSS.match(
      /\[data-maid-session-row\] svg\[data-state='ongoing'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const runningCellRule = CSS.match(
      /\[data-maid-session-row\] svg\[data-state='ongoing'\] > rect\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const reducedMotionRules = [...CSS.matchAll(
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/g,
    )].map(match => match[1]).join('\n')
    expect(runningDotRule).toContain('width: 12px')
    expect(runningDotRule).toContain('radial-gradient')
    expect(runningDotRule).toContain('shape-rendering: geometricPrecision')
    expect(runningCellRule).toContain('fill: currentColor')
    expect(runningCellRule).toContain('animation: maidAtelierSessionJewelChase 1s linear infinite')
    expect(CSS).toContain('@keyframes maidAtelierSessionJewelChase')
    expect(reducedMotionRules).toContain("svg[data-state='ongoing'] > rect")
    expect(reducedMotionRules).toContain('animation: none')
  })

  it('layers the sidebar companion beneath translucent session glass without moving it', () => {
    const mascotRule = CSS.match(/\[data-skin-chrome='sidebar-mascot'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const nativeContentRule = CSS.match(
      /:is\(\[data-pane='sidebar'\], \[class\*='sidebarCol'\]\) > div > :not\([\s\S]*?\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const selectedPlateRule = CSS.match(
      /\[data-maid-session-row\]:not\(\[data-maid-session-flat\]\)\[aria-selected='true'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const hoverRule = CSS.match(
      /\[data-maid-session-row\]:hover:not\(\[aria-selected='true'\]\),[\s\S]*?\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(mascotRule).toContain('bottom: calc(var(--maid-sidebar-swag-height) + 68px)')
    expect(mascotRule).toContain('width: var(--maid-sidebar-mascot-width)')
    expect(mascotRule).toContain('max-height: 38%')
    expect(mascotRule).toContain('z-index: 1')
    expect(mascotRule).toContain('pointer-events: none')
    expect(mascotRule).toContain('opacity: 0.7')
    expect(mascotRule).toContain('saturate(0.94)')
    expect(nativeContentRule).toContain('z-index: 2')
    expect(nativeContentRule).toContain('background: transparent')
    expect(selectedPlateRule).toContain('backdrop-filter: blur(4px) saturate(0.9)')
    expect(selectedPlateRule).toContain('-webkit-backdrop-filter: blur(4px) saturate(0.9)')
    expect(hoverRule).toContain('backdrop-filter: blur(3px) saturate(0.92)')
    expect(hoverRule).toContain('-webkit-backdrop-filter: blur(3px) saturate(0.92)')
    expect(CSS).toContain('rgba(226, 243, 255, 0.66)')
    expect(CSS).toContain('rgba(24, 49, 111, 0.48)')
  })

  it('uses the theme-specific vector ribbon without overriding its slices', () => {
    const lightWorkspaceRule = CSS.match(
      /:not\(\[data-ds-dark-theme\]\) \[data-maid-workspace-active\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const lightRibbonRule = CSS.match(
      /:not\(\[data-ds-dark-theme\]\) \[data-maid-workspace-active\]::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const nightRibbonRule = CSS.match(
      /\[data-ds-dark-theme\] \[data-maid-workspace-active\]::before\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const lightSessionRule = CSS.match(
      /body\[data-dsh-maid-atelier\]:not\(\[data-ds-dark-theme\]\)\s*\[data-maid-session-row\]:not\(\[data-maid-session-flat\]\)\[aria-selected='true'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const nightSessionRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-ds-dark-theme\]\s*\[data-maid-session-row\]:not\(\[data-maid-session-flat\]\)\[aria-selected='true'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(lightWorkspaceRule).toContain('color: var(--maid-component-ink)')
    expect(lightWorkspaceRule).toContain('text-shadow: none')
    expect(lightRibbonRule).toContain('drop-shadow(0 5px 8px')
    expect(lightRibbonRule).not.toContain('border-image: none')
    expect(nightRibbonRule).toContain('drop-shadow(0 6px 10px')
    expect(nightRibbonRule).not.toContain('border-image: none')
    expect(lightSessionRule).toContain('background: var(--maid-selected-session-fill)')
    expect(nightSessionRule).toContain('background: var(--maid-selected-session-fill)')
  })

  it('keeps independently sized landing and workspace trim layers', () => {
    const topTrimRule = CSS.match(/\[data-skin-chrome='top-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const landingTrimRule = CSS.match(/\[data-skin-trim-layer='landing'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const workspaceTrimRule = CSS.match(/\[data-skin-trim-layer='workspace'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(topTrimRule).toContain('height: 60px')
    expect(topTrimRule).toContain('overflow: hidden')
    expect(landingTrimRule).toContain('height: 60px')
    expect(landingTrimRule).toContain('background-image: var(--maid-top-lace-raster-art)')
    expect(landingTrimRule).toContain('background-size: auto 60px')
    expect(workspaceTrimRule).toContain('height: 60px')
    expect(workspaceTrimRule).toContain('background-image: var(--maid-top-lace-raster-art)')
    expect(workspaceTrimRule).toContain('background-size: auto 60px')
    expect(topTrimRule).toContain('inset: 0 0 auto var(--maid-sidebar-width)')
    expect(topTrimRule).not.toContain('translate: var(--maid-sidebar-width) 0')
    expect(topTrimRule).not.toContain('box-shadow')
  })

  it('paints one non-repeating raster lace strip per edge with an SVG fallback state', () => {
    const landingTrimRule = CSS.match(/\[data-skin-trim-layer='landing'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const workspaceTrimRule = CSS.match(/\[data-skin-trim-layer='workspace'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const bottomTrimRule = CSS.match(/\[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''

    for (const rule of [landingTrimRule, workspaceTrimRule]) {
      expect(rule).toContain('background-image: var(--maid-top-lace-raster-art)')
      expect(rule).toContain('background-repeat: no-repeat')
      expect(rule).toContain('background-size: auto 60px')
    }
    expect(bottomTrimRule).toContain('background-image: var(--maid-bottom-lace-raster-art)')
    expect(bottomTrimRule).toContain('background-repeat: no-repeat')
    expect(bottomTrimRule).toContain('background-size: auto 60px')
    expect(CSS).toContain("[data-skin-trim-raster='unavailable']")
    expect(CSS).toContain('var(--maid-top-crown-art)')
    expect(CSS).toContain('var(--maid-left-cluster-art)')
  })

  it('pairs the full-width bottom lace with a fixed center crest', () => {
    const bottomTrimRule = CSS.match(/\[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const crownRule = CSS.match(
      /\[data-skin-chrome='bottom-trim'\] > \[data-skin-trim-part='crown'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const crestRule = CSS.match(
      /\[data-skin-chrome='bottom-trim'\] > \[data-skin-trim-part='crown'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(bottomTrimRule).toContain('inset: auto 0 0 var(--maid-sidebar-width)')
    expect(bottomTrimRule).not.toContain('translate: var(--maid-sidebar-width) 0')
    expect(bottomTrimRule).toContain('background-image: var(--maid-bottom-lace-raster-art)')
    expect(bottomTrimRule).toContain('background-size: auto 60px')
    expect(bottomTrimRule).toContain('background-repeat: no-repeat')
    expect(crownRule).toContain('width: min(460px, calc(100% - 304px))')
    expect(crownRule).toContain('height: 44px')
    expect(crownRule).toContain('overflow: hidden')
    expect(crownRule).toContain('background: none')
    expect(crestRule).toContain("content: ''")
    expect(crestRule).toContain('width: 42px')
    expect(crestRule).toContain('left: 50%')
    expect(crestRule).toContain('transform: translateX(-50%)')
    expect(crestRule).toContain('background: var(--maid-bottom-crest-art) center / contain no-repeat')
  })

  it('moves the bottom embroidery with the composer phase', () => {
    const bottomTrimRule = CSS.match(/\[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const activeTrimRule = CSS.match(
      /:has\(\[data-phase='active'\]\) \[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const movingTrimRule = CSS.match(
      /body\[data-dsh-maid-atelier\]\[data-maid-composer-motion\]\s*\[data-skin-chrome='bottom-trim'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(bottomTrimRule).not.toContain('translate: var(--maid-sidebar-width) 0')
    expect(bottomTrimRule).toContain('transform: translateY(0)')
    expect(bottomTrimRule).toContain('transition: transform 520ms')
    expect(bottomTrimRule).not.toContain('transition: translate 520ms')
    expect(activeTrimRule).toContain('transform: translateY(100%)')
    expect(activeTrimRule).not.toContain('--maid-sidebar-width')
    expect(movingTrimRule).toContain('will-change: transform')
  })

  it('slides the landing trim upward while the workspace trim drops from above', () => {
    const trimLayerRule = CSS.match(/\[data-skin-trim-layer\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const landingTrimRule = CSS.match(/\[data-skin-trim-layer='landing'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const workspaceTrimRule = CSS.match(/\[data-skin-trim-layer='workspace'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const activeLandingRule = CSS.match(
      /:has\(header \[role='tablist'\]\)[\s\S]*?\[data-skin-trim-layer='landing'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const activeWorkspaceRule = CSS.match(
      /:has\(header \[role='tablist'\]\)[\s\S]*?\[data-skin-trim-layer='workspace'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(trimLayerRule).toContain('transition: transform 520ms')
    expect(landingTrimRule).toContain('transform: translateY(0)')
    expect(workspaceTrimRule).toContain('transform: translateY(-100%)')
    expect(activeLandingRule).toContain('transform: translateY(-100%)')
    expect(activeWorkspaceRule).toContain('transform: translateY(0)')
  })

  it('keeps modular maid lace hidden behind the raster while preserving its fallback geometry', () => {
    const topCrownRule = CSS.match(
      /\[data-skin-trim-layer\] > \[data-skin-trim-part='crown'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const topCrestRule = CSS.match(
      /\[data-skin-trim-layer\] > \[data-skin-trim-part='crown'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const leftClusterRule = CSS.match(
      /\[data-skin-trim-part='cluster-left'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const rightClusterRule = CSS.match(
      /\[data-skin-trim-part='cluster-right'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const connectorRule = CSS.match(
      /\[data-skin-trim-part\^='cluster-'\]::after\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const clusterRule = CSS.match(
      /\[data-skin-trim-part\^='cluster-'\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(topCrownRule).toContain('width: min(520px, calc(100% - 304px))')
    expect(topCrownRule).toContain('height: 44px')
    expect(topCrownRule).toContain('overflow: hidden')
    expect(topCrownRule).toContain('left: calc((100% - var(--dsh-scrollbar-width)) / 2)')
    expect(topCrownRule).toContain('background: none')
    expect(topCrestRule).toContain('left: 50%')
    expect(topCrestRule).toContain('background: var(--maid-center-crest-art) center / contain no-repeat')
    expect(leftClusterRule).toContain('left: 24px')
    expect(leftClusterRule).toContain('background-image: var(--maid-left-cluster-art)')
    expect(rightClusterRule).toContain('right: calc(24px + var(--dsh-scrollbar-width))')
    expect(rightClusterRule).toContain('background-image: var(--maid-right-cluster-art)')
    expect(clusterRule).toContain('width: 128px')
    expect(clusterRule).toContain('height: 44px')
    expect(clusterRule).toContain('overflow: hidden')
    expect(clusterRule).toContain('opacity: 0')
    expect(connectorRule).toContain('border-bottom: 1px solid var(--maid-palace-gold)')
    expect(connectorRule).toContain('border-radius: 0 0 50% 50%')
    expect(connectorRule).not.toContain('repeating-radial-gradient')
    expect(CSS).toContain('@container maidTrim (max-width: 899px)')
    expect(CSS).toContain('@container maidTrim (max-width: 619px)')
    expect(CSS).not.toMatch(/\[data-skin-trim-layer\]::before\s*\{/)
    expect(CSS).not.toMatch(/\[data-skin-chrome='bottom-trim'\]::before\s*\{/)
    expect(CSS).not.toContain('--maid-bow-art')
  })

  it('keeps the animated workspace trim above its tablist without reserving lace space', () => {
    const workspaceHeaderRule = CSS.match(
      /body\[data-dsh-maid-atelier\] header:has\(\[role='tablist'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(workspaceHeaderRule).toContain('position: relative')
    expect(workspaceHeaderRule).toContain('z-index: 21')
    expect(workspaceHeaderRule).not.toContain('padding-bottom')
    expect(workspaceHeaderRule).toContain('border-bottom: 0')
    const rootRule = CSS.match(/\[id='root'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rootRule).toContain('position: relative')
    expect(rootRule).not.toContain('z-index')
  })

  it('does not reserve or paint a lace field in active conversation and inspection views', () => {
    expect(CSS).not.toContain('padding-bottom: 66px')
    expect(CSS).not.toContain('padding-bottom: 28px')
    expect(CSS).not.toMatch(
      /:has\(header \[role='tablist'\]\):not\(:has\(\[data-conversation-scroll\] \[data-chat-flow\]\)\)[\s\S]*?background-color:/s,
    )
    expect(CSS).not.toMatch(
      /:has\(\[role='toolbar'\]\[aria-label='Trajectory toolbar'\]\)[\s\S]*?background-color:/s,
    )
  })

  it('softens workspace entry and disables decorative motion when requested', () => {
    const workspaceHeaderRule = CSS.match(
      /body\[data-dsh-maid-atelier\] header:has\(\[role='tablist'\]\)\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const reducedMotionRule = CSS.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    )?.[1] ?? ''
    const workspaceHeaderKeyframes = CSS.match(
      /@keyframes maidAtelierWorkspaceHeaderEnter\s*\{[\s\S]*?\r?\n\}/,
    )?.[0] ?? ''
    expect(workspaceHeaderRule).toContain('animation: maidAtelierWorkspaceHeaderEnter 320ms 110ms both')
    expect(workspaceHeaderKeyframes).toContain('@keyframes maidAtelierWorkspaceHeaderEnter')
    expect(workspaceHeaderKeyframes).not.toContain('padding-bottom:')
    expect(reducedMotionRule).toContain('transition: none')
    expect(reducedMotionRule).toContain('animation: none')
    expect(reducedMotionRule).toContain('[data-skin-trim-part]')
    expect(reducedMotionRule).toContain('[data-maid-workspace-active]::before')
  })

  it('keeps the skin chrome aligned to the live sidebar width and restores the prior value', async () => {
    document.body.style.setProperty('--maid-sidebar-width', 'legacy')
    document.body.innerHTML = '<div data-pane="sidebar"><div></div></div>'
    const sidebar = document.querySelector<HTMLElement>("[data-pane='sidebar']")
    sidebar!.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 312,
      height: 900,
      top: 0,
      right: 312,
      bottom: 900,
      left: 0,
      toJSON: () => ({}),
    })

    fiber = await mount()
    const widthRule = document.head
      .querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")!
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-width: 312px')
    expect(widthRule.sheet!.cssRules[0].cssText).not.toContain('--maid-crest-inline-offset')
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-swag-height: 80.34px')
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-mascot-width: 255.84px')
    expect(document.body.dataset.maidSidebarSize).toBe('wide')
    await fiber.dispose()
    expect(document.body.style.getPropertyValue('--maid-sidebar-width')).toBe('legacy')
    expect(document.head.querySelector("[data-skin-chrome='sidebar-width-rule']")).toBeNull()
  })

  it('tracks animated sidebar width without mutating the body style attribute', async () => {
    let resize: ResizeObserverCallback | undefined
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback
      }

      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    })
    document.body.innerHTML = '<div data-pane="sidebar"><div></div></div>'

    fiber = await mount()
    const bodyStyle = document.body.getAttribute('style')
    resize?.([
      { contentRect: { width: 96 } as DOMRectReadOnly } as ResizeObserverEntry,
    ], {} as ResizeObserver)

    const widthRule = document.head
      .querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")!
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-width: 96px')
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-swag-height: 54px')
    expect(document.body.dataset.maidSidebarSize).toBe('rail')
    expect(document.body.getAttribute('style')).toBe(bodyStyle)
  })

  it('marks narrow and missing sidebars so Chat can reclaim the left gutter', async () => {
    document.body.innerHTML = '<div data-pane="sidebar"><div></div></div>'
    const sidebar = document.querySelector<HTMLElement>("[data-pane='sidebar']")!
    sidebar.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 80,
      height: 900,
      top: 0,
      right: 80,
      bottom: 900,
      left: 0,
      toJSON: () => ({}),
    })

    fiber = await mount()
    expect(document.body.dataset.maidSidebarCompact).toBe('')
    expect(document.body.dataset.maidSidebarSize).toBe('rail')
    const widthRule = document.head
      .querySelector<HTMLStyleElement>("[data-skin-chrome='sidebar-width-rule']")!
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-width: 80px')
    sidebar.remove()
    await flushMutations()
    expect(widthRule.sheet!.cssRules[0].cssText).toContain('--maid-sidebar-width: 0px')
    await fiber.dispose()
    expect(document.body.hasAttribute('data-maid-sidebar-compact')).toBe(false)
    expect(document.body.hasAttribute('data-maid-sidebar-size')).toBe(false)
  })

  it('switches between matched day and night backgrounds with the base theme', async () => {
    fiber = await mount()
    const scene = document.querySelector<HTMLElement>("[data-skin-chrome='scene-stage']")!
    const light = scene.style.backgroundImage
    expect(getComputedStyle(scene).backgroundPosition).toBe('left center')
    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    const dark = scene.style.backgroundImage
    expect(dark).not.toBe(light)
    expect(dark).toContain('data:image/webp;base64,')
    expect(dark).not.toContain('linear-gradient')
    expect(getComputedStyle(scene).backgroundPosition).toBe('left center')
    delete document.body.dataset.dsDarkTheme
    await flushMutations()
    expect(scene.style.backgroundImage).toBe(light)
    expect(getComputedStyle(scene).backgroundPosition).toBe('left center')
  })

  it('switches every ornament between independent day and night assets', async () => {
    fiber = await mount()
    const day = ORNAMENT_PROPERTIES.map(name => document.body.style.getPropertyValue(name))

    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    const night = ORNAMENT_PROPERTIES.map(name => document.body.style.getPropertyValue(name))

    ORNAMENT_PROPERTIES.forEach((property, index) => {
      expect(day[index]).toContain(ornamentMediaType(property))
      expect(night[index]).toContain(ornamentMediaType(property))
    })
    expect(night.every((value, index) => value !== day[index])).toBe(true)
  })

  it('uses detailed independent raster rails for the day and night composer crown', async () => {
    fiber = await mount()
    const day = embeddedPngFromCssUrl(
      document.body.style.getPropertyValue('--maid-composer-rail-art'),
    )

    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    const night = embeddedPngFromCssUrl(
      document.body.style.getPropertyValue('--maid-composer-rail-art'),
    )

    expect(pngDimensions(day).width).toBeGreaterThanOrEqual(1400)
    expect(pngDimensions(night).width).toBeGreaterThanOrEqual(1400)
    expect(day.byteLength).toBeGreaterThan(100_000)
    expect(night.byteLength).toBeGreaterThan(100_000)
    expect(day).not.toBe(night)
  })

  it('embeds independent high-resolution material frames for day and night content', async () => {
    fiber = await mount()
    const day = embeddedPngFromCssUrl(
      document.body.style.getPropertyValue('--maid-content-frame-art'),
    )

    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    const night = embeddedPngFromCssUrl(
      document.body.style.getPropertyValue('--maid-content-frame-art'),
    )

    expect(pngDimensions(day).width).toBeGreaterThanOrEqual(2000)
    expect(pngDimensions(night).width).toBeGreaterThanOrEqual(2000)
    expect(day.byteLength).toBeGreaterThan(500_000)
    expect(night.byteLength).toBeGreaterThan(500_000)
    expect(day).not.toBe(night)
  })

  it('paints the native new-session icon with the resolved whale ornament', async () => {
    const style = document.createElement('style')
    style.dataset.maidTestStyle = ''
    style.textContent = CSS.match(
      /body\[data-dsh-maid-atelier\] button\[class\*='newSession'\] svg\s*\{[^}]*\}/s,
    )?.[0] ?? ''
    document.head.append(style)
    document.body.innerHTML = `
      <button class="fixture_newSession" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg>
        <span>新会话</span>
      </button>
    `

    const button = document.querySelector<HTMLButtonElement>('button')!
    const icon = button.querySelector<SVGElement>('svg')!
    fiber = await mount()
    const day = document.body.style.getPropertyValue('--maid-new-session-icon-art')
    const dayBackground = getComputedStyle(icon).backgroundImage

    document.body.dataset.dsDarkTheme = ''
    await flushMutations()
    const night = document.body.style.getPropertyValue('--maid-new-session-icon-art')
    const nightBackground = getComputedStyle(icon).backgroundImage

    expect(day).toContain('data:image/png;base64')
    expect(night).toContain('data:image/png;base64')
    expect(night).not.toBe(day)
    expect(dayBackground).toBe('var(--maid-new-session-icon-art)')
    expect(nightBackground).toBe('var(--maid-new-session-icon-art)')
    expect(button.querySelector('svg')).toBe(icon)
    expect(CSS).toMatch(/\[data-maid-workspace-row\] > \[class\*='folder'\]\s*\{[^}]*width: 34px[^}]*height: 38px/s)
  })

  it('switches the native theme through one accessible continuity control', async () => {
    document.body.innerHTML = '<div data-pane="sidebar"><div></div></div><div class="fixture_titlebar"></div>'
    fiber = await mount()

    const button = document.querySelector<HTMLButtonElement>("[data-skin-chrome='theme-toggle']")
    const orbit = button?.querySelector<HTMLElement>('[data-maid-toggle-orbit]')
    expect(button).not.toBeNull()
    expect(orbit).not.toBeNull()
    expect(orbit?.querySelectorAll('[data-maid-toggle-icon]')).toHaveLength(2)
    expect(button?.type).toBe('button')
    expect(button?.getAttribute('aria-label')).toBe('切换到夜间主题')
    expect(button?.getAttribute('aria-pressed')).toBe('false')
    expect(document.body.hasAttribute('data-ds-dark-theme')).toBe(false)

    button?.click()
    await flushMutations()

    expect(document.body.hasAttribute('data-ds-dark-theme')).toBe(true)
    expect(button?.getAttribute('aria-label')).toBe('切换到白昼主题')
    expect(button?.getAttribute('aria-pressed')).toBe('true')
    expect(document.body.dataset.maidThemeTransition).toBe('night')

    expect(CSS).toMatch(/\[data-skin-chrome='theme-toggle'\]\s*\{[^}]*width: 96px/s)
    expect(CSS).toMatch(/\[data-maid-toggle-orbit\]\s*\{[^}]*left: 5px[^}]*transition:[^}]*left/s)
    expect(CSS).toMatch(/\[data-ds-dark-theme\] \[data-maid-toggle-orbit\]\s*\{[^}]*left: 63px/s)
    expect(CSS).toMatch(/:has\(header \[role='tablist'\]\) \[data-skin-chrome='theme-toggle'\]\s*\{[^}]*right: 154px/s)
    expect(CSS).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\[data-maid-toggle-orbit\][\s\S]*?transition: none/s)

    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='theme-toggle']")).toBeNull()
    expect(document.body.hasAttribute('data-maid-theme-transition')).toBe(false)
  })

  it('creates a deterministic continuously phased atmosphere layer and retracts it', async () => {
    fiber = await mount()

    const atmosphere = document.querySelector("[data-skin-chrome='atmosphere']")
    const particles = [...atmosphere!.querySelectorAll<HTMLElement>('[data-maid-particle]')]
    expect(atmosphere).not.toBeNull()
    expect(particles).toHaveLength(24)
    expect(particles[0]?.style.getPropertyValue('--x')).toBe('6%')
    expect(particles[0]?.style.getPropertyValue('--delay')).toBe('-0.8s')
    expect(particles[0]?.style.getPropertyValue('--duration')).toBe('15s')
    expect(particles[0]?.style.getPropertyValue('--bubble-size')).toBe('5px')
    expect(particles[0]?.style.getPropertyValue('--star-size')).toBe('2px')
    expect(particles[0]?.style.getPropertyValue('--drift')).toBe('-14px')
    expect(new Set(particles.map(particle => particle.style.getPropertyValue('--delay'))).size).toBe(24)
    expect(particles.every(particle => particle.style.getPropertyValue('--y') !== '')).toBe(true)

    const dayParticleRule = CSS.match(
      /body\[data-dsh-maid-atelier\] \[data-maid-particle\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    const nightParticleRule = CSS.match(
      /\[data-ds-dark-theme\] \[data-maid-particle\]\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(dayParticleRule).toContain('animation: deepWhaleBubbleRise var(--duration) var(--delay) linear infinite')
    expect(nightParticleRule).toContain('width: var(--star-size)')
    expect(nightParticleRule).toContain(
      'animation: deepWhaleStarDrift var(--duration) var(--delay) ease-in-out infinite alternate',
    )
    expect(CSS).toMatch(/@keyframes deepWhaleStarDrift[\s\S]*?translate3d\(var\(--drift\), -24px, 0\)/)
    expect(CSS).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\[data-maid-particle\][\s\S]*?animation: none/,
    )

    await fiber.dispose()
    expect(document.querySelector("[data-skin-chrome='atmosphere']")).toBeNull()
  })

  it('switches immediately without a view transition when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const startViewTransition = vi.fn(() => ({
      ready: Promise.resolve(),
      finished: Promise.resolve(),
    }))
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition,
    })
    fiber = await mount()

    document.querySelector<HTMLButtonElement>("[data-skin-chrome='theme-toggle']")?.click()
    await flushMutations()

    expect(document.body.hasAttribute('data-ds-dark-theme')).toBe(true)
    expect(startViewTransition).not.toHaveBeenCalled()
    delete (document as Document & { startViewTransition?: unknown }).startViewTransition
  })
})
