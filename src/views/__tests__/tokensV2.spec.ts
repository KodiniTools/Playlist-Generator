import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_DIR = resolve(__dirname, '../..')

/** Dateien, die vollständig auf Tokens v2 (--ds-*) laufen; neue Umstellungen hier ergänzen. */
const MIGRATED = [
  'assets/main.css',
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

/** Element-Selektoren, die main.css nicht mehr global stylen darf (Komponenten sind scoped). */
const FORBIDDEN_GLOBAL_ELEMENTS = [
  'header',
  'details',
  'summary',
  'input',
  'select',
  'textarea',
  'button',
  'a',
  'p',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'table',
]

function readSource(file: string): string {
  return readFileSync(resolve(SRC_DIR, file), 'utf8')
}

/** Bei .vue nur die <style>-Blöcke, bei .css die ganze Datei. */
function css(file: string): string {
  const source = readSource(file)
  if (file.endsWith('.css')) return source
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '').join('\n')
}

describe('Tokens v2 in umgestellten Dateien', () => {
  it.each(MIGRATED)('%s nutzt nur --ds-* Variablen', (file) => {
    const styles = css(file)
    expect(styles.length).toBeGreaterThan(0)
    const foreign = [...styles.matchAll(/var\((--[a-z0-9-]+)/g)]
      .map((m) => m[1] ?? '')
      .filter((name) => !name.startsWith('--ds-') && !ALLOWED_FOREIGN_VARS.has(name))
    expect([...new Set(foreign)]).toEqual([])
  })

  it.each(MIGRATED)('%s enthält keine Legacy-Effekte', (file) => {
    const styles = css(file)
    const found = LEGACY_PATTERNS.filter(([, pattern]) => pattern.test(styles)).map(
      ([label]) => label,
    )
    expect(found).toEqual([])
  })
})

describe('main.css als reine Basis', () => {
  const mainCss = readSource('assets/main.css')

  it('stylt keine Elemente global, die Komponenten selbst stylen', () => {
    const leaking = FORBIDDEN_GLOBAL_ELEMENTS.filter((element) =>
      new RegExp(`^\\s*${element}\\b[^{]*\\{`, 'm').test(mainCss),
    )
    expect(leaking).toEqual([])
  })

  it('beschränkt die SSI-Footer-Angleichung auf Elemente außerhalb von #app', () => {
    const footerSelectors = mainCss
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^\.?footer\b/.test(line))
    expect(footerSelectors.length).toBeGreaterThan(0)
    const unscoped = footerSelectors.filter((selector) => !selector.includes(':not(#app *)'))
    expect(unscoped).toEqual([])
  })

  it('bindet beide Token-Dateien ein und definiert keine eigenen Variablen', () => {
    expect(mainCss).toContain("@import '../design-system/tokens.css';")
    expect(mainCss).toContain("@import '../design-system/tokens-v2.css';")
    const ownVariables = [...mainCss.matchAll(/^\s*(--[a-z][\w-]*)\s*:/gm)]
      .map((m) => m[1] ?? '')
      .filter((name) => !name.startsWith('--nav-') && !name.startsWith('--dropdown-'))
      .filter((name) => name !== '--accent-color')
    expect(ownVariables).toEqual([])
  })

  it('legt die Variablen der SSI-Navigation mit ausreichender Spezifität auf Tokens', () => {
    // Das Partial setzt [data-theme='dark'] .global-nav (0,2,0) mit !important;
    // der Override muss darüber liegen und beide Themes abdecken.
    const rule = mainCss.match(
      /html body \.global-nav,\s*html\[data-theme\] body \.global-nav \{([^}]*)\}/,
    )
    expect(rule).not.toBeNull()
    const body = rule?.[1] ?? ''
    expect(body).toContain('--nav-bg: var(--ds-surface-1)')
    expect(body).toContain('--nav-text: var(--ds-text)')
    expect(body).toContain('--accent-color: var(--ds-accent)')
    expect(body).toMatch(/background: var\(--ds-surface-1\) !important/)
    expect(mainCss).toMatch(
      /\.global-nav-lang-btn\.active \{[^}]*color: var\(--ds-on-accent\) !important/,
    )
  })
})
