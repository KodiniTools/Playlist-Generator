import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Dateien, die vollständig auf Tokens v2 (--ds-*) laufen; neue Umstellungen hier ergänzen. */
const MIGRATED = [
  'views/AppPage.vue',
  'views/LandingPage.vue',
  'views/FaqPage.vue',
  'views/BlogPage.vue',
  'components/AppHeader.vue',
  'components/OnboardingBanner.vue',
  'components/ToolsGrid.vue',
]

/** Außer --ds-* ist nur die vom SSI-Layout gesetzte Nav-Höhe erlaubt. */
const ALLOWED_FOREIGN_VARS = new Set(['--external-nav-height'])

const LEGACY_PATTERNS: ReadonlyArray<[string, RegExp]> = [
  ['linear-gradient', /linear-gradient\(/],
  ['rgba()', /rgba?\(/],
  ['Hex-Farbe', /#[0-9a-f]{3,8}\b/i],
  ['.light-theme', /\.light-theme/],
  ['backdrop-filter', /backdrop-filter/],
  ['@keyframes', /@keyframes/],
]

function styleBlocks(file: string): string {
  const source = readFileSync(resolve(__dirname, '../..', file), 'utf8')
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '').join('\n')
}

describe('Tokens v2 in umgestellten Seiten und Komponenten', () => {
  it.each(MIGRATED)('%s nutzt nur --ds-* Variablen', (file) => {
    const css = styleBlocks(file)
    expect(css.length).toBeGreaterThan(0)
    const foreign = [...css.matchAll(/var\((--[a-z0-9-]+)/g)]
      .map((m) => m[1] ?? '')
      .filter((name) => !name.startsWith('--ds-') && !ALLOWED_FOREIGN_VARS.has(name))
    expect([...new Set(foreign)]).toEqual([])
  })

  it.each(MIGRATED)('%s enthält keine Legacy-Effekte', (file) => {
    const css = styleBlocks(file)
    const found = LEGACY_PATTERNS.filter(([, pattern]) => pattern.test(css)).map(([label]) => label)
    expect(found).toEqual([])
  })
})
