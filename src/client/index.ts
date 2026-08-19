/**
 * Deep Whale day/night skin. The client entry keeps theme-specific scene
 * plates, sidebar companions, ambient effects, and ornamental chrome as
 * independent layers. The sidebar keeps the product's native vector wordmark;
 * every skin-owned write is restored by the Cordis effect disposer.
 */
import type { Context } from '@deepseek-ai/cordis'
import { MAID_ATELIER_ICON } from './art.ts'
import {
  DEEP_WHALE_DAY_COMPANION,
  DEEP_WHALE_DAY_SCENE,
  DEEP_WHALE_NIGHT_COMPANION,
  DEEP_WHALE_NIGHT_SCENE,
} from './deep-whale-art.generated.ts'
import './maid-atelier.module.css'
import {
  DEEP_WHALE_DAY_ORNAMENTS,
  DEEP_WHALE_NIGHT_ORNAMENTS,
  DEEP_WHALE_ORNAMENT_PROPERTIES,
} from './ornament-art.ts'
import { BALANCED_PARTICLE_LIMIT, installMotionController } from './motion.ts'
import { MAID_ATELIER_TITLEBAR_BRAND } from './titlebar-brand.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    theme: {
      setTheme(id: 'light' | 'dark'): void
    }
  }
}

const SKIN_TITLE = '鲸鱼娘昼夜工坊 · DeepSeek Harness'
const SKIN_OWNER = 'maid-atelier'
const SKIN_SYSTEM_CHROME_DAY = '#edf7ff'
const SKIN_SYSTEM_CHROME_NIGHT = '#071632'
const SIDEBAR_COLUMN_SELECTOR = ":is([data-pane='sidebar'], [class*='sidebarCol'])"

const ATMOSPHERE_PARTICLES = [
  { x: '6%', y: '18%', delay: '-0.8s', duration: '15s', bubbleSize: '5px', starSize: '2px', drift: '-14px' },
  { x: '11%', y: '62%', delay: '-1.6s', duration: '19s', bubbleSize: '9px', starSize: '3px', drift: '18px' },
  { x: '16%', y: '34%', delay: '-2.4s', duration: '17s', bubbleSize: '6px', starSize: '2px', drift: '-22px' },
  { x: '21%', y: '76%', delay: '-3.2s', duration: '21s', bubbleSize: '11px', starSize: '4px', drift: '26px' },
  { x: '27%', y: '12%', delay: '-4s', duration: '16s', bubbleSize: '7px', starSize: '2px', drift: '-18px' },
  { x: '32%', y: '48%', delay: '-4.8s', duration: '20s', bubbleSize: '10px', starSize: '3px', drift: '30px' },
  { x: '37%', y: '27%', delay: '-5.6s', duration: '18s', bubbleSize: '4px', starSize: '2px', drift: '-26px' },
  { x: '42%', y: '69%', delay: '-6.4s', duration: '22s', bubbleSize: '12px', starSize: '4px', drift: '20px' },
  { x: '47%', y: '41%', delay: '-7.2s', duration: '15s', bubbleSize: '6px', starSize: '3px', drift: '-16px' },
  { x: '52%', y: '83%', delay: '-8s', duration: '19s', bubbleSize: '8px', starSize: '2px', drift: '24px' },
  { x: '57%', y: '21%', delay: '-8.8s', duration: '17s', bubbleSize: '5px', starSize: '3px', drift: '-30px' },
  { x: '62%', y: '57%', delay: '-9.6s', duration: '21s', bubbleSize: '11px', starSize: '4px', drift: '16px' },
  { x: '67%', y: '32%', delay: '-10.4s', duration: '16s', bubbleSize: '7px', starSize: '2px', drift: '-20px' },
  { x: '72%', y: '73%', delay: '-11.2s', duration: '20s', bubbleSize: '9px', starSize: '3px', drift: '28px' },
  { x: '77%', y: '16%', delay: '-12s', duration: '18s', bubbleSize: '5px', starSize: '2px', drift: '-24px' },
  { x: '82%', y: '52%', delay: '-12.8s', duration: '22s', bubbleSize: '12px', starSize: '4px', drift: '32px' },
  { x: '87%', y: '37%', delay: '-13.6s', duration: '15s', bubbleSize: '6px', starSize: '3px', drift: '-18px' },
  { x: '92%', y: '79%', delay: '-14.4s', duration: '19s', bubbleSize: '10px', starSize: '2px', drift: '22px' },
  { x: '96%', y: '24%', delay: '-15.2s', duration: '17s', bubbleSize: '4px', starSize: '3px', drift: '-28px' },
  { x: '14%', y: '46%', delay: '-16s', duration: '21s', bubbleSize: '8px', starSize: '4px', drift: '14px' },
  { x: '34%', y: '88%', delay: '-16.8s', duration: '16s', bubbleSize: '5px', starSize: '2px', drift: '-32px' },
  { x: '54%', y: '9%', delay: '-17.6s', duration: '20s', bubbleSize: '9px', starSize: '3px', drift: '26px' },
  { x: '74%', y: '64%', delay: '-18.4s', duration: '18s', bubbleSize: '7px', starSize: '2px', drift: '-16px' },
  { x: '89%', y: '44%', delay: '-19.2s', duration: '22s', bubbleSize: '11px', starSize: '4px', drift: '30px' },
] as const

/** Required browser service: the official light/dark palette owner. */
export const inject = ['theme']

const BACKDROP_PROPERTIES = [
  '--maid-sidebar-width',
  ...DEEP_WHALE_ORNAMENT_PROPERTIES,
] as const

function createSceneStage(): HTMLDivElement {
  const stage = document.createElement('div')
  stage.dataset.skinChrome = 'scene-stage'
  stage.dataset.skinOwner = SKIN_OWNER
  stage.setAttribute('aria-hidden', 'true')
  return stage
}

function createAtmosphere(): HTMLDivElement {
  const atmosphere = document.createElement('div')
  atmosphere.dataset.skinChrome = 'atmosphere'
  atmosphere.dataset.skinOwner = SKIN_OWNER
  atmosphere.setAttribute('aria-hidden', 'true')
  for (const [index, profile] of ATMOSPHERE_PARTICLES
    .slice(0, BALANCED_PARTICLE_LIMIT)
    .entries()) {
    const particle = document.createElement('span')
    particle.dataset.maidParticle = String(index + 1)
    particle.style.setProperty('--x', profile.x)
    particle.style.setProperty('--y', profile.y)
    particle.style.setProperty('--delay', profile.delay)
    particle.style.setProperty('--duration', profile.duration)
    particle.style.setProperty('--bubble-size', profile.bubbleSize)
    particle.style.setProperty('--star-size', profile.starSize)
    particle.style.setProperty('--drift', profile.drift)
    atmosphere.append(particle)
  }
  return atmosphere
}

function createThemeToggle(): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.skinChrome = 'theme-toggle'
  button.dataset.skinOwner = SKIN_OWNER
  button.innerHTML = `
    <span data-maid-toggle-orbit aria-hidden="true">
      <svg data-maid-toggle-icon="sun" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
        <path d="M12 2v2.25M12 19.75V22M2 12h2.25M19.75 12H22M4.93 4.93l1.6 1.6M17.47 17.47l1.6 1.6M19.07 4.93l-1.6 1.6M6.53 17.47l-1.6 1.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.55" />
      </svg>
      <svg data-maid-toggle-icon="moon" viewBox="0 0 24 24">
        <path d="M20.2 15.35A8.25 8.25 0 0 1 8.65 3.8 8.25 8.25 0 1 0 20.2 15.35Z" fill="currentColor" />
        <path d="m16.8 4.3.42 1.05 1.05.42-1.05.42-.42 1.05-.42-1.05-1.05-.42 1.05-.42.42-1.05Z" fill="currentColor" />
      </svg>
    </span>
    <span data-maid-toggle-label></span>
  `
  return button
}

function createSidebarCorners(): HTMLDivElement {
  const corners = document.createElement('div')
  corners.dataset.skinChrome = 'sidebar-corners'
  corners.dataset.skinOwner = SKIN_OWNER
  corners.setAttribute('aria-hidden', 'true')
  for (const position of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
    const corner = document.createElement('span')
    corner.dataset.skinCorner = position
    corners.append(corner)
  }
  return corners
}

/**
 * Place the whale-free DeepSeek Harness wordmark at the left of the
 * frameless title bar (Web-app overlay / desktop shell), mirroring the
 * sidebar brand at a smaller scale.
 */
function decorateTitlebarBrand(): void {
  const titlebar = document.querySelector<HTMLElement>("[class*='titlebar']")
  if (!titlebar) return
  if (titlebar.querySelector("[data-skin-chrome='titlebar-brand']")) return
  const brand = document.createElement('span')
  brand.dataset.skinChrome = 'titlebar-brand'
  brand.dataset.skinOwner = SKIN_OWNER
  brand.setAttribute('aria-hidden', 'true')
  brand.innerHTML = MAID_ATELIER_TITLEBAR_BRAND
  titlebar.prepend(brand)
}
function decorateSidebar(): void {
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  const sidebarRoot = sidebar?.querySelector<HTMLElement>(':scope > div')
  if (!sidebar || !sidebarRoot) return

  sidebar.querySelectorAll<HTMLElement>('[data-maid-sidebar-footer]').forEach((element) => {
    delete element.dataset.maidSidebarFooter
  })
  const settingsSlot = sidebar.querySelector<HTMLElement>("[data-slot='sidebar.settings']")
  if (settingsSlot) {
    let footer = settingsSlot.parentElement
    while (footer && footer !== sidebar) {
      if (footer.querySelector("[data-slot='sidebar.footer.action']")) {
        footer.dataset.maidSidebarFooter = ''
        break
      }
      footer = footer.parentElement
    }
  }

  if (!sidebarRoot.querySelector("[data-skin-chrome='sidebar-corners']")) {
    sidebarRoot.prepend(createSidebarCorners())
  }

  if (!sidebarRoot.querySelector('[data-maid-companion]')) {
    const fragment = document.createDocumentFragment()
    for (const [theme, source] of [
      ['day', DEEP_WHALE_DAY_COMPANION],
      ['night', DEEP_WHALE_NIGHT_COMPANION],
    ] as const) {
      const mascot = document.createElement('img')
      mascot.dataset.skinChrome = 'sidebar-mascot'
      mascot.dataset.skinOwner = SKIN_OWNER
      mascot.dataset.maidCompanion = theme
      mascot.setAttribute('aria-hidden', 'true')
      mascot.alt = ''
      mascot.src = source
      fragment.append(mascot)
    }
    sidebarRoot.prepend(fragment)
  }

}

function decorateWorkspaceTree(): void {
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  if (!sidebar) return

  sidebar.querySelectorAll<HTMLElement>(
    '[data-maid-workspace-group], [data-maid-workspace-row], [data-maid-workspace-active], [data-maid-session-row], [data-maid-session-flat], [data-maid-session-first], [data-maid-session-last]',
  ).forEach((element) => {
    delete element.dataset.maidWorkspaceGroup
    delete element.dataset.maidWorkspaceRow
    delete element.dataset.maidWorkspaceActive
    delete element.dataset.maidSessionRow
    delete element.dataset.maidSessionFlat
    delete element.dataset.maidSessionFirst
    delete element.dataset.maidSessionLast
  })

  sidebar.querySelectorAll<HTMLElement>("[role='tree']").forEach((tree) => {
    const rows = [...tree.querySelectorAll<HTMLElement>("[role='treeitem']")]
    if (tree.matches("[class*='flatList']") && !rows.some(row => row.hasAttribute('aria-expanded'))) {
      rows.filter(row => row.hasAttribute('aria-selected')).forEach((sessionRow) => {
        sessionRow.dataset.maidSessionRow = ''
        sessionRow.dataset.maidSessionFlat = ''
      })
      return
    }

    let workspaceRow: HTMLElement | undefined
    let sessionRows: HTMLElement[] = []
    const decorateGroup = (): void => {
      if (!workspaceRow) return

      workspaceRow.dataset.maidWorkspaceRow = ''
      if (workspaceRow.parentElement) workspaceRow.parentElement.dataset.maidWorkspaceGroup = ''
      sessionRows.forEach((sessionRow) => {
        sessionRow.dataset.maidSessionRow = ''
      })
      if (sessionRows[0]) sessionRows[0].dataset.maidSessionFirst = ''
      if (sessionRows.at(-1)) sessionRows.at(-1)!.dataset.maidSessionLast = ''

      const containsCurrent = workspaceRow.getAttribute('aria-expanded') === 'true'
        && sessionRows.some(sessionRow => sessionRow.getAttribute('aria-selected') === 'true')
      if (containsCurrent) workspaceRow.dataset.maidWorkspaceActive = ''
    }

    rows.forEach((row) => {
      if (row.hasAttribute('aria-expanded')) {
        decorateGroup()
        workspaceRow = row
        sessionRows = []
      } else if (workspaceRow && row.hasAttribute('aria-selected')) {
        sessionRows.push(row)
      }
    })
    decorateGroup()
  })
}

function decorateComposerSelectorRow(): void {
  document.querySelectorAll<HTMLElement>('[data-maid-composer-selector-row]').forEach((row) => {
    delete row.dataset.maidComposerSelectorRow
  })
  document.querySelectorAll<HTMLElement>(
    "[data-phase='hero'] [class*='heroWorkspaceRow']",
  ).forEach((row) => {
    row.dataset.maidComposerSelectorRow = ''
  })
}

/**
 * Apply the skin-owned background and independently retractable chrome.
 * @param ctx - owning context whose effect retracts every DOM and CSS write.
 */
export function activateMaidAtelier(ctx: Context): () => void {
  const body = document.body
  const originalTitle = document.title
  let themeColorMeta: HTMLMetaElement | null = null
  let previousThemeColor: string | undefined
  const syncSystemChrome = (): void => {
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta === null) return
    if (meta !== themeColorMeta) {
      themeColorMeta = meta
      previousThemeColor = meta.content
    }
    const color = body.hasAttribute('data-ds-dark-theme')
      ? SKIN_SYSTEM_CHROME_NIGHT
      : SKIN_SYSTEM_CHROME_DAY
    if (meta.content !== color) meta.content = color
  }
  const themeColorObserver = new MutationObserver(syncSystemChrome)
  themeColorObserver.observe(document.head, {
    attributes: true,
    attributeFilter: ['content'],
    childList: true,
    subtree: true,
  })
  syncSystemChrome()
  const previous = new Map<string, string>()
  for (const property of BACKDROP_PROPERTIES) {
    previous.set(property, body.style.getPropertyValue(property))
  }

  body.dataset.dshMaidAtelier = ''
  const disposeMotion = installMotionController(body)
  const sceneStage = createSceneStage()
  const themeToggle = createThemeToggle()
  const atmosphere = createAtmosphere()
  body.append(sceneStage, atmosphere, themeToggle)

  const syncThemeAppearance = (): void => {
    const dark = body.hasAttribute('data-ds-dark-theme')
    const source = dark ? DEEP_WHALE_NIGHT_SCENE : DEEP_WHALE_DAY_SCENE
    const ornaments = dark ? DEEP_WHALE_NIGHT_ORNAMENTS : DEEP_WHALE_DAY_ORNAMENTS
    sceneStage.style.setProperty('background-image', `url(${source})`)
    sceneStage.style.setProperty('background-position', 'left center')
    for (const property of DEEP_WHALE_ORNAMENT_PROPERTIES) {
      body.style.setProperty(property, ornaments[property])
    }
    themeToggle.setAttribute('aria-label', dark ? '切换到白昼主题' : '切换到夜间主题')
    themeToggle.setAttribute('aria-pressed', String(dark))
    const label = themeToggle.querySelector<HTMLElement>('[data-maid-toggle-label]')
    if (label) label.textContent = dark ? '白昼' : '夜间'
    syncSystemChrome()
  }
  syncThemeAppearance()

  let observedSidebar: HTMLElement | undefined
  let resizeObserver: ResizeObserver | undefined
  let composerPhase: 'hero' | 'active' | undefined
  let composerMotionTimer: ReturnType<typeof setTimeout> | undefined
  let themeTransitionTimer: ReturnType<typeof setTimeout> | undefined

  const clearThemeTransition = (): void => {
    delete body.dataset.maidThemeTransition
    themeTransitionTimer = undefined
  }
  const switchTheme = (): void => {
    if (themeTransitionTimer !== undefined) return
    const next = body.hasAttribute('data-ds-dark-theme') ? 'light' : 'dark'
    body.dataset.maidThemeTransition = next === 'dark' ? 'night' : 'day'
    const update = (): void => { ctx.theme.setTheme(next) }
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update()
      clearThemeTransition()
      return
    }
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>
        finished: Promise<void>
      }
    }
    const transition = transitionDocument.startViewTransition?.(update)
    if (transition !== undefined) {
      void transition.ready.then(() => {
        const rect = themeToggle.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
        document.documentElement.animate(
          { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 560,
            easing: 'cubic-bezier(0.22, 0.78, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          } as KeyframeAnimationOptions,
        )
      }).catch(() => {
        // Browsers may reject a pending transition when the document loses visibility.
      })
      void transition.finished.finally(clearThemeTransition)
      themeTransitionTimer = setTimeout(clearThemeTransition, 700)
      return
    }
    update()
    themeTransitionTimer = setTimeout(clearThemeTransition, 420)
  }
  themeToggle.addEventListener('click', switchTheme)

  // 宽度联动写入独立的 <style> 规则而非 body style：CSSOM 修改不产生
  // attribute mutation，Chrome autofill 的 MutationObserver 不会逐帧触发，
  // 因此可以每帧跟随侧边栏宽度（幕布瞬移跟手）而无需防抖节流。
  const widthSheet = document.createElement('style')
  widthSheet.dataset.skinChrome = 'sidebar-width-rule'
  widthSheet.dataset.skinOwner = SKIN_OWNER
  document.head.append(widthSheet)
  widthSheet.sheet!.insertRule('body { --maid-sidebar-width: 280px; --maid-sidebar-swag-height: 72.1px; --maid-sidebar-mascot-width: 229.6px; --maid-titlebar-height: 0px; }')
  // The official frame rules reference env(titlebar-area-height), but the
  // CSS-modules pipeline rewrites the env() identifier there too, so the
  // title-bar row silently falls back to an auto row: expanding the sidebar
  // is fine, but collapsing it lets the content row’s max-content grow and
  // stretches the title-bar row to hundreds of pixels. Re-assert the rows
  // here through CSSOM, where env() survives verbatim (fallback 40px keeps
  // the headless/plain-tab mock sane), and pin the drag handles to the same
  // boundary.
  // insertRule defaults to index 0, which would push the body rule aside and
  // orphan the widthRule reference; append explicitly so cssRules[0] stays
  // the body variable rule.
  const appendRule = (rule: string): void => {
    widthSheet.sheet!.insertRule(rule, widthSheet.sheet!.cssRules.length)
  }
  appendRule('body[data-dsh-maid-atelier] [class*=\"frame\"][data-wco] { grid-template-rows: env(titlebar-area-height, 40px) 1fr; }')
  appendRule('body[data-dsh-maid-atelier] [class*=\"frame\"][data-desktop] { grid-template-rows: 32px 1fr; }')
  appendRule('body[data-dsh-maid-atelier] [class*=\"frame\"] [class*=\"handle\"] { top: var(--maid-titlebar-height, 0px); }')

  const widthRule = widthSheet.sheet!.cssRules[0] as CSSStyleRule
  // The curtain is position:fixed, so it needs the viewport-space top of
  // the frame's title-bar row. Measuring the sidebar column (the row below
  // it) is authoritative: whatever the title-bar height is — WCO env(), the
  // desktop 32px row, or a scaled window — the curtain lands exactly on the
  // rendered boundary, never a pixel off.
  const syncTitlebarHeight = (): void => {
    const columns = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (columns !== null) {
      const top = columns.getBoundingClientRect().top
      if (top > 0) {
        widthRule.style.setProperty('--maid-titlebar-height', `${top}px`)
        return
      }
    }
    // Desktop shell: fixed 32px row (columns not laid out yet).
    if ((window as Window & { dshDesktop?: unknown }).dshDesktop !== undefined) {
      widthRule.style.setProperty('--maid-titlebar-height', '32px')
      return
    }
    widthRule.style.setProperty('--maid-titlebar-height', '0px')
  }
  const titlebarOverlay = (navigator as Navigator & {
    windowControlsOverlay?: {
      addEventListener(type: 'geometrychange', listener: () => void): void
      removeEventListener(type: 'geometrychange', listener: () => void): void
    }
  }).windowControlsOverlay
  titlebarOverlay?.addEventListener('geometrychange', syncTitlebarHeight)
  syncTitlebarHeight()

  const applySidebarWidth = (width: number): void => {
    if (width <= 0) return
    const roundPx = (value: number): string => `${Math.round(value * 100) / 100}px`
    widthRule.style.setProperty('--maid-sidebar-width', roundPx(width))
    widthRule.style.setProperty('--maid-sidebar-swag-height', roundPx(Math.min(94, Math.max(54, width * 0.2575))))
    widthRule.style.setProperty('--maid-sidebar-mascot-width', roundPx(Math.min(320, width * 0.82)))
    body.dataset.maidSidebarSize = width <= 120 ? 'rail' : width <= 220 ? 'narrow' : 'wide'
    if (width <= 104) body.dataset.maidSidebarCompact = ''
    else delete body.dataset.maidSidebarCompact
  }

  const clearSidebarWidth = (): void => {
    widthRule.style.setProperty('--maid-sidebar-width', '0px')
    widthRule.style.setProperty('--maid-sidebar-swag-height', '54px')
    widthRule.style.setProperty('--maid-sidebar-mascot-width', '0px')
    body.dataset.maidSidebarSize = 'rail'
    body.dataset.maidSidebarCompact = ''
  }

  const ensureSidebarObserved = (): void => {
    const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (!sidebar || !resizeObserver || sidebar === observedSidebar) return
    if (observedSidebar) resizeObserver.unobserve(observedSidebar)
    observedSidebar = sidebar
    resizeObserver.observe(sidebar)
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.at(-1)
      if (entry) applySidebarWidth(entry.contentRect.width)
    })
  }

  const syncComposerMotion = (): void => {
    decorateComposerSelectorRow()
    const phaseRoot = document.querySelector<HTMLElement>("[data-phase='hero'], [data-phase='active']")
    const next = phaseRoot?.dataset.phase
    if (next !== 'hero' && next !== 'active') return

    if (composerPhase !== undefined && composerPhase !== next) {
      body.dataset.maidComposerMotion = next === 'active' ? 'dock' : 'rise'
      if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
      composerMotionTimer = setTimeout(() => {
        delete body.dataset.maidComposerMotion
        composerMotionTimer = undefined
      }, 560)
    }
    composerPhase = next
  }

  decorateSidebar()
  decorateWorkspaceTree()
  ensureSidebarObserved()
  const initialSidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  if (initialSidebar) applySidebarWidth(initialSidebar.getBoundingClientRect().width)
  syncComposerMotion()

  const syncSidebarDecorations = (): void => {
    syncTitlebarHeight()
    decorateTitlebarBrand()
    decorateSidebar()
    decorateWorkspaceTree()
    ensureSidebarObserved()
    const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (sidebar === null) clearSidebarWidth()
    else if (resizeObserver === undefined) applySidebarWidth(sidebar.getBoundingClientRect().width)
  }

  const isSkinChrome = (node: Node): boolean => (
    node instanceof Element && node.getAttribute('data-skin-owner') === SKIN_OWNER
  )

  // ResizeObserver writes the animated width through CSSOM, so it never enters
  // this observer. Keep structural decoration in the MutationObserver checkpoint
  // before paint: delaying every change made the wide/rail hand-off visibly late.
  // Skin-owned insertions are ignored so decorating a React-owned node cannot
  // schedule a redundant whole-sidebar pass.
  const observer = new MutationObserver((records) => {
    let sidebarStructureChanged = false
    let workspaceStateChanged = false
    let backdropChanged = false
    let composerChanged = false
    for (const record of records) {
      if (record.type === 'attributes') {
        if (record.attributeName === 'aria-expanded' || record.attributeName === 'aria-selected') {
          workspaceStateChanged = true
        } else if (record.attributeName === 'data-ds-dark-theme') {
          backdropChanged = true
        } else if (record.attributeName === 'data-phase') {
          composerChanged = true
        }
        continue
      }
      const appNodes = [...record.addedNodes, ...record.removedNodes]
        .some(node => node instanceof Element && !isSkinChrome(node))
      if (appNodes) {
        sidebarStructureChanged = true
        composerChanged = true
      }
    }
    if (sidebarStructureChanged) syncSidebarDecorations()
    else if (workspaceStateChanged) decorateWorkspaceTree()
    if (backdropChanged) syncThemeAppearance()
    if (composerChanged) syncComposerMotion()
  })
  observer.observe(body, {
    attributes: true,
    attributeFilter: ['aria-expanded', 'aria-selected', 'data-ds-dark-theme', 'data-phase'],
    childList: true,
    subtree: true,
  })

  const appendPalaceTrimParts = (host: HTMLElement): void => {
    for (const part of ['crown', 'cluster-left', 'cluster-right'] as const) {
      const element = document.createElement('div')
      element.dataset.skinTrimPart = part
      element.dataset.skinOwner = SKIN_OWNER
      element.setAttribute('aria-hidden', 'true')
      host.append(element)
    }
  }

  const topTrim = document.createElement('div')
  topTrim.dataset.skinChrome = 'top-trim'
  topTrim.dataset.skinOwner = SKIN_OWNER
  topTrim.setAttribute('aria-hidden', 'true')
  const landingTrimLayer = document.createElement('div')
  landingTrimLayer.dataset.skinTrimLayer = 'landing'
  const workspaceTrimLayer = document.createElement('div')
  workspaceTrimLayer.dataset.skinTrimLayer = 'workspace'
  appendPalaceTrimParts(landingTrimLayer)
  appendPalaceTrimParts(workspaceTrimLayer)
  topTrim.append(landingTrimLayer, workspaceTrimLayer)
  body.append(topTrim)

  const bottomTrim = document.createElement('div')
  bottomTrim.dataset.skinChrome = 'bottom-trim'
  bottomTrim.dataset.skinOwner = SKIN_OWNER
  bottomTrim.setAttribute('aria-hidden', 'true')
  appendPalaceTrimParts(bottomTrim)
  body.append(bottomTrim)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/png'
  favicon.href = MAID_ATELIER_ICON
  favicon.dataset.skinChrome = 'favicon'
  favicon.dataset.skinOwner = SKIN_OWNER
  document.head.append(favicon)

  document.title = SKIN_TITLE

  let active = true
  return () => {
    if (!active) return
    active = false
    disposeMotion()
    delete body.dataset.dshMaidAtelier
    delete body.dataset.maidComposerMotion
    delete body.dataset.maidSidebarCompact
    delete body.dataset.maidSidebarSize
    delete body.dataset.maidThemeTransition
    if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
    if (themeTransitionTimer !== undefined) clearTimeout(themeTransitionTimer)
    themeToggle.removeEventListener('click', switchTheme)
    observer.disconnect()
    themeColorObserver.disconnect()
    titlebarOverlay?.removeEventListener('geometrychange', syncTitlebarHeight)
    resizeObserver?.disconnect()
    for (const [property, value] of previous) {
      body.style.setProperty(property, value)
    }
    document.querySelectorAll(`[data-skin-owner='${SKIN_OWNER}']`).forEach(element => element.remove())
    document.querySelectorAll<HTMLElement>(
      '[data-maid-composer-selector-row], [data-maid-sidebar-footer], [data-maid-workspace-group], [data-maid-workspace-row], [data-maid-workspace-active], [data-maid-session-row], [data-maid-session-flat], [data-maid-session-first], [data-maid-session-last]',
    ).forEach((element) => {
      delete element.dataset.maidComposerSelectorRow
      delete element.dataset.maidSidebarFooter
      delete element.dataset.maidWorkspaceGroup
      delete element.dataset.maidWorkspaceRow
      delete element.dataset.maidWorkspaceActive
      delete element.dataset.maidSessionRow
      delete element.dataset.maidSessionFlat
      delete element.dataset.maidSessionFirst
      delete element.dataset.maidSessionLast
    })
    if (themeColorMeta?.isConnected
      && (themeColorMeta.content === SKIN_SYSTEM_CHROME_DAY
        || themeColorMeta.content === SKIN_SYSTEM_CHROME_NIGHT)) {
      themeColorMeta.content = previousThemeColor ?? ''
    }
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }
}

/** Activate the complete skin while this browser plugin fiber is mounted. */
export function apply(ctx: Context): void {
  ctx.effect(() => activateMaidAtelier(ctx), 'ui-skin-deep-whale-day-night: browser skin')
}
