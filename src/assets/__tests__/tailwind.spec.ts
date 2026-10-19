// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile } from '@tailwindcss/node'
import { describe, expect, it } from 'vitest'

const ASSETS_DIR = resolve(__dirname, '..')
const tailwindCss = readFileSync(resolve(ASSETS_DIR, 'tailwind.css'), 'utf8')
const tokensCss = readFileSync(resolve(ASSETS_DIR, '../design-system/tokens-v2.css'), 'utf8')

async function build(candidates: string[]): Promise<string> {
  const compiler = await compile(tailwindCss, { base: ASSETS_DIR, onDependency: () => {} })
  return compiler.build(candidates)
}

describe('tailwind.css', () => {
  it('verweist nur auf existierende --ds-* Tokens', () => {
    const defined = new Set([...tokensCss.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
    const referenced = [...tailwindCss.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1])
    expect(referenced.length).toBeGreaterThan(50)
    expect(referenced.filter((name) => !defined.has(name))).toEqual([])
  })

  it('erzeugt Utilities mit tw:-Präfix direkt auf var(--ds-*)', async () => {
    const css = await build(['tw:bg-surface-1', 'tw:p-4', 'tw:text-text-2', 'tw:rounded-md'])
    expect(css).toContain('background-color: var(--ds-surface-1)')
    expect(css).toContain('padding: var(--ds-space-4)')
    expect(css).toContain('color: var(--ds-text-2)')
    expect(css).toContain('border-radius: var(--ds-radius-md)')
  })

  it('erzeugt nichts für Werte außerhalb der Tokens oder ohne Präfix', async () => {
    const css = await build([
      'tw:bg-red-500',
      'tw:p-7',
      'tw:text-base',
      'flex',
      'hidden',
      'container',
    ])
    expect(css).not.toMatch(/\.tw\\:bg-red-500|\.tw\\:p-7|\.tw\\:text-base/)
    expect(css).not.toMatch(/(^|[\s}])\.(flex|hidden|container)\s*\{/)
  })

  it('bringt weder Preflight noch Theme-Variablen in :root mit', async () => {
    // Variablennamen im Quelltext lassen Tailwind sonst Theme-Variablen in :root ausgeben.
    const css = await build([
      'tw:bg-surface-1',
      'tw:font-bold',
      '--color-border',
      '--tw-color-border',
    ])
    expect(tailwindCss).not.toMatch(/@import\s+['"]tailwindcss['"]/)
    expect(tailwindCss).not.toContain('preflight')
    expect(css).not.toMatch(/:root|:host/)
    expect(css).not.toMatch(/--color-|--spacing-/)
  })
})
