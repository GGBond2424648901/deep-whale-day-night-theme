// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  BALANCED_PARTICLE_LIMIT,
  installMotionController,
  resolveMotionMode,
} from '../src/client/motion.ts'

const originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden')

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete document.body.dataset.maidMotion
  if (originalHidden === undefined) delete (document as Document & { hidden?: boolean }).hidden
  else Object.defineProperty(document, 'hidden', originalHidden)
})

describe('Deep Whale motion controller', () => {
  it('selects balanced only for a visible accelerated motion-enabled document', () => {
    expect(resolveMotionMode({ hidden: false, prefersReducedMotion: false, acceleratedWebGL: true }))
      .toBe('balanced')
    expect(resolveMotionMode({ hidden: true, prefersReducedMotion: false, acceleratedWebGL: true }))
      .toBe('reduced')
    expect(resolveMotionMode({ hidden: false, prefersReducedMotion: true, acceleratedWebGL: true }))
      .toBe('reduced')
    expect(resolveMotionMode({ hidden: false, prefersReducedMotion: false, acceleratedWebGL: false }))
      .toBe('reduced')
    expect(BALANCED_PARTICLE_LIMIT).toBe(10)
  })

  it('reduces while hidden, restores while visible, and retracts its body write', () => {
    let hidden = false
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('WebGLRenderingContext', class {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never)
    document.body.dataset.maidMotion = 'legacy'

    const dispose = installMotionController(document.body, document, window)
    expect(document.body.dataset.maidMotion).toBe('balanced')

    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(document.body.dataset.maidMotion).toBe('reduced')

    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(document.body.dataset.maidMotion).toBe('balanced')

    dispose()
    expect(document.body.dataset.maidMotion).toBe('legacy')

    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(document.body.dataset.maidMotion).toBe('legacy')
  })
})
