import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { translations, useTranslation } from '../useTranslation'

const SRC_DIR = resolve(__dirname, '../..')
const SOURCE_EXT = /\.(vue|ts|js)$/
/** Literale Aufrufe `t('key')` bzw. `t.value('key')`; `$emit('x')` o. ä. werden nicht erfasst. */
const LITERAL_KEY = /(?<![\w$.])t(?:\.value)?\(\s*'([A-Za-z0-9_]+)'\s*\)/g

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') sourceFiles(path, out)
    } else if (
      SOURCE_EXT.test(entry) &&
      !entry.endsWith('.d.ts') &&
      entry !== 'useTranslation.js'
    ) {
      out.push(path)
    }
  }
  return out
}

function literalKeysInSource(): Map<string, string[]> {
  const keys = new Map<string, string[]>()
  for (const file of sourceFiles(SRC_DIR)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(LITERAL_KEY)) {
      const key = match[1]
      if (key === undefined) continue
      const users = keys.get(key) ?? []
      users.push(file.slice(SRC_DIR.length + 1))
      keys.set(key, users)
    }
  }
  return keys
}

describe('useTranslation', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('de und en haben denselben Schlüsselsatz mit nicht leeren Werten', () => {
    const de = Object.keys(translations.de).sort()
    const en = Object.keys(translations.en).sort()
    expect(en).toEqual(de)

    const empty = de.filter(
      (key) => translations.de[key]?.trim() === '' || translations.en[key]?.trim() === '',
    )
    expect(empty).toEqual([])
  })

  it('jeder im Code literal verwendete Schlüssel ist in beiden Sprachen übersetzt', () => {
    const used = literalKeysInSource()
    expect(used.size).toBeGreaterThan(50)

    const missing = [...used.entries()]
      .filter(([key]) => !(key in translations.de) || !(key in translations.en))
      .map(([key, files]) => `${key} (${files.join(', ')})`)
    expect(missing).toEqual([])
  })

  it('gibt unbekannte Schlüssel unverändert zurück und wechselt die Sprache', () => {
    const { t, setLanguage } = useTranslation()
    expect(t.value('kein_solcher_schluessel')).toBe('kein_solcher_schluessel')
    expect(t.value('nav_home')).toBe('Start')

    setLanguage('en')
    expect(t.value('nav_home')).toBe('Home')
  })
})
