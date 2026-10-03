import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import tokens from '../tokens.json'
import { breakpoints, colorCssVar, colorToken, cssVar, themeColors } from '../tokens'

const resolve = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))
const read = (relative: string) => readFileSync(resolve(relative), 'utf8')

const tokensCss = read('../tokens.css')
const mainCss = read('../../assets/main.css')

type Declarations = Record<string, string>

interface TokenLeaf {
  path: string
  value: string
  cssVar?: string
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()

/** Liest alle Custom Properties eines Blocks mit exakt diesem Selektor (keine verschachtelten Blöcke). */
function parseBlock(css: string, selector: string): Declarations {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = withoutComments.match(new RegExp(`(^|\\n)${escaped}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`Block "${selector}" nicht in tokens.css gefunden`)

  const declarations: Declarations = {}
  for (const [, name, value] of (match[2] ?? '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (name !== undefined && value !== undefined) declarations[name] = normalize(value)
  }
  return declarations
}

/** Sammelt alle Token-Blätter ($value) aus dem JSON mit ihrem Pfad. */
function collectTokens(node: unknown, path: string[] = []): TokenLeaf[] {
  if (typeof node !== 'object' || node === null) return []
  const record = node as Record<string, unknown>

  if ('$value' in record) {
    const extensions = record.$extensions as { css?: string } | undefined
    return [{ path: path.join('.'), value: String(record.$value), cssVar: extensions?.css }]
  }

  return Object.entries(record)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => collectTokens(child, [...path, key]))
}

function listFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => join(entry.parentPath, entry.name))
}

const rootBlock = parseBlock(tokensCss, ':root')
const lightBlock = parseBlock(tokensCss, '.light-theme')
const dataThemeLightBlock = parseBlock(tokensCss, ":root[data-theme='light']")
const allTokens = collectTokens(tokens)

describe('tokens.json ↔ tokens.css', () => {
  it('definiert jedes Token mit CSS-Variable im passenden Block mit identischem Wert', () => {
    const withCss = allTokens.filter(
      (token): token is TokenLeaf & { cssVar: string } => token.cssVar !== undefined,
    )
    expect(withCss.length).toBeGreaterThan(100)

    const mismatches = withCss.flatMap((token) => {
      const block = token.path.includes('light') ? lightBlock : rootBlock
      const actual = block[token.cssVar]
      const expected = normalize(token.value)
      return actual === expected
        ? []
        : [`${token.path} (${token.cssVar}): css=${actual} json=${expected}`]
    })
    expect(mismatches).toEqual([])
  })

  it('hat in :root keine CSS-Variable, die im JSON fehlt', () => {
    const declared = new Set(allTokens.map((token) => token.cssVar).filter(Boolean))
    const missingInJson = Object.keys(rootBlock).filter((variable) => !declared.has(variable))
    expect(missingInJson).toEqual([])
  })

  it('hat für Dark und Light dieselben Farb-Tokens', () => {
    expect(Object.keys(tokens.color.light).sort()).toEqual(Object.keys(tokens.color.dark).sort())
    expect(Object.keys(tokens.ssi.light).sort()).toEqual(
      Object.keys(tokens.ssi.dark)
        .filter((key) => !['transitionBase', 'externalNavHeight'].includes(key))
        .sort(),
    )
  })

  it('spiegelt html[data-theme=light] exakt aus .light-theme', () => {
    const mismatches = Object.entries(dataThemeLightBlock)
      .filter(([variable, value]) => lightBlock[variable] !== value)
      .map(
        ([variable, value]) =>
          `${variable}: data-theme=${value} light-theme=${lightBlock[variable]}`,
      )
    expect(mismatches).toEqual([])
  })

  it('deklariert theme-abhängige Composite-Tokens auch in .light-theme', () => {
    const themeDependent = Object.entries(rootBlock).filter(
      ([, value]) => value.includes('var(--shadow-color)') || value.includes('var(--glow-color)'),
    )
    expect(themeDependent.length).toBeGreaterThan(0)
    const missingInLight = themeDependent
      .filter(([variable, value]) => lightBlock[variable] !== value)
      .map(([variable]) => variable)
    expect(missingInLight).toEqual([])
  })
})

describe('main.css', () => {
  it('importiert tokens.css und definiert selbst keine Theme-Variablen mehr', () => {
    expect(mainCss).toContain("@import '../design-system/tokens.css';")
    expect(mainCss).not.toMatch(/^\s*--accent-color\s*:/m)
    expect(mainCss).not.toMatch(/^\s*--color-primary\s*:/m)
  })
})

describe('Verwendung in Komponenten', () => {
  it('nutzt nur definierte Variablen oder gibt einen Fallback an', () => {
    // Vue-Starter-Reste (nicht eingebunden, nutzen Variablen aus dem ebenfalls ungenutzten base.css)
    const starterLeftovers = ['WelcomeItem.vue', 'TheWelcome.vue', 'HelloWorld.vue']
    const files = [
      ...listFiles(resolve('../../components'), ['.vue']),
      ...listFiles(resolve('../../views'), ['.vue']),
      resolve('../../assets/main.css'),
    ].filter((file) => !starterLeftovers.some((name) => file.endsWith(name)))
    const defined = new Set([...Object.keys(rootBlock), ...Object.keys(lightBlock)])
    const undefinedWithoutFallback: string[] = []

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const [, variable, terminator] of source.matchAll(/var\(\s*(--[\w-]+)\s*(,|\))/g)) {
        if (variable !== undefined && terminator === ')' && !defined.has(variable)) {
          undefinedWithoutFallback.push(`${file}: ${variable}`)
        }
      }
    }

    expect(undefinedWithoutFallback).toEqual([])
  })
})

describe('tokens.ts', () => {
  it('liefert Farbwerte, Variablennamen und var()-Ausdrücke', () => {
    expect(colorToken('dark', 'accent')).toBe('#c9984d')
    expect(colorToken('light', 'accent')).toBe('#014f99')
    expect(colorCssVar('accent')).toBe('--accent-color')
    expect(cssVar('accent')).toBe('var(--accent-color)')
    expect(cssVar('muted', '#666')).toBe('var(--muted-color, #666)')
  })

  it('liefert eine flache Farbkarte je Theme', () => {
    const dark = themeColors('dark')
    const light = themeColors('light')
    expect(Object.keys(dark)).toEqual(Object.keys(tokens.color.dark))
    expect(dark.bg).toBe('#091428')
    expect(light.bg).toBe('#f5f4d6')
  })

  it('liefert Breakpoints als Zahlen', () => {
    expect(breakpoints).toEqual({ tablet: 768, onboarding: 540, phone: 480 })
  })
})
