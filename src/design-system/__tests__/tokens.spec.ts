import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import tokens from '../tokens.json'
import { breakpoints, colorCssVar, colorToken, cssVar, themeColors } from '../tokens'
import {
  collectTokens,
  normalize,
  parseBlock,
  readRelative,
  resolveFrom,
  type TokenLeaf,
} from './tokenTestUtils'

const base = import.meta.url
const tokensCss = readRelative(base, '../tokens.css')
const mainCss = readRelative(base, '../../assets/main.css')

function listFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)))
    .map((entry) => join(entry.parentPath, entry.name))
}

const rootBlock = parseBlock(tokensCss, ':root', 'tokens.css')
const lightBlock = parseBlock(tokensCss, '.light-theme', 'tokens.css')
const dataThemeLightBlock = parseBlock(tokensCss, ":root[data-theme='light']", 'tokens.css')
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
    const files = [
      ...listFiles(resolveFrom(base, '../../components'), ['.vue']),
      ...listFiles(resolveFrom(base, '../../views'), ['.vue']),
      resolveFrom(base, '../../assets/main.css'),
    ]
    const v2Css = readRelative(base, '../tokens-v2.css')
    const defined = new Set([
      ...Object.keys(rootBlock),
      ...Object.keys(lightBlock),
      ...Object.keys(parseBlock(v2Css, ':root', 'tokens-v2.css')),
    ])
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
