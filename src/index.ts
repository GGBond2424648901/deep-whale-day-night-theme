/** Host registration for the lifecycle-owned Deep Whale builtin theme. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-theme-catalog'
import { MAID_ATELIER_REGISTRATION } from './manifest.ts'

export const inject = ['themeCatalog']

/** Publish the manifest and preview bytes while this plugin is composed. */
export function apply(ctx: Context): void {
  ctx.effect(
    () => ctx.themeCatalog.registerBuiltin(MAID_ATELIER_REGISTRATION),
    'ui-skin-maid-atelier: builtin catalog registration',
  )
}
