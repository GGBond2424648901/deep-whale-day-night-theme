/** Runtime motion budget selected from visibility, user preference, and GPU support. */
export type MaidMotionMode = 'balanced' | 'reduced'

/** Signals that determine whether continuous skin motion is safe. */
export interface MotionSignals {
  acceleratedWebGL: boolean
  hidden: boolean
  prefersReducedMotion: boolean
}

/** Maximum number of independently animated atmosphere elements. */
export const BALANCED_PARTICLE_LIMIT = 10

/** Resolve the motion budget without touching browser globals. */
export function resolveMotionMode(signals: MotionSignals): MaidMotionMode {
  return signals.hidden || signals.prefersReducedMotion || !signals.acceleratedWebGL
    ? 'reduced'
    : 'balanced'
}

/** Detect a hardware-accelerated WebGL context without accepting a major caveat fallback. */
export function detectAcceleratedWebGL(documentRef: Document): boolean {
  if (typeof globalThis.WebGLRenderingContext === 'undefined'
    && typeof globalThis.WebGL2RenderingContext === 'undefined') return false

  try {
    const canvas = documentRef.createElement('canvas')
    const options: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true }
    return canvas.getContext('webgl2', options) !== null
      || canvas.getContext('webgl', options) !== null
  } catch {
    return false
  }
}

/**
 * Publish and maintain the skin motion mode for one document.
 * @returns disposer that restores the previous body attribute exactly.
 */
export function installMotionController(
  body: HTMLElement,
  documentRef: Document = document,
  windowRef: Window = window,
): () => void {
  const previous = body.getAttribute('data-maid-motion')
  const matchMedia = typeof windowRef.matchMedia === 'function'
    ? windowRef.matchMedia.bind(windowRef)
    : typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia.bind(globalThis) : undefined
  const prefersReducedMotion = matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const acceleratedWebGL = detectAcceleratedWebGL(documentRef)
  const sync = (): void => {
    body.dataset.maidMotion = resolveMotionMode({
      acceleratedWebGL,
      hidden: documentRef.hidden,
      prefersReducedMotion,
    })
  }

  documentRef.addEventListener('visibilitychange', sync)
  sync()

  let active = true
  return () => {
    if (!active) return
    active = false
    documentRef.removeEventListener('visibilitychange', sync)
    if (previous === null) delete body.dataset.maidMotion
    else body.setAttribute('data-maid-motion', previous)
  }
}
