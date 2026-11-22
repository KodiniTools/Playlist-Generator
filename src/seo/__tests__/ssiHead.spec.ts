import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import de from '../../i18n/de'
import en from '../../i18n/en'
import { PAGES, jsonForScript, structuredData } from '../pageMeta'
import {
  SEO_HEAD_END,
  SEO_HEAD_START,
  applySsiHead,
  buildSsiHead,
  buildSsiVars,
  headTags,
  ldChunks,
} from '../ssiHead'

const t = { de, en }
const ROOT = resolve(__dirname, '../../..')
const indexHtml = () => readFileSync(resolve(ROOT, 'index.html'), 'utf8')

/** Was ein Browser ohne SSI (vite preview, Desktop) sieht: Kommentare fallen weg. */
const withoutSsi = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '')
const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0

describe('headTags', () => {
  it('liefert englische Tags mit Canonical ?lang=en und hreflang', () => {
    const tags = headTags(PAGES.faq!, 'en', t)
    expect(tags).toContain(`<title>${en.meta_title_faq}</title>`)
    expect(tags).toContain(
      "<link rel='canonical' href='https://kodinitools.com/playlist_generator/faq?lang=en' />",
    )
    expect(tags).toContain(
      "<link rel='alternate' hreflang='x-default' href='https://kodinitools.com/playlist_generator/faq' />",
    )
  })

  it('maskiert Zeichen, die HTML oder den SSI-Wert brechen würden', () => {
    const tricky = { ...de, meta_title_landing: `A & "B" it's $X \\ <i>` }
    const tags = headTags(PAGES.landing!, 'de', { de: tricky, en })
    expect(tags).toContain('<title>A &amp; &quot;B&quot; it&#39;s &#36;X &#92; &lt;i&gt;</title>')
    // Die Tags selbst bleiben einfach gequotet; nur das JSON-LD braucht doppelte Anführungszeichen
    expect(tags.split('<script')[0]).not.toContain('"')
  })
})

/** Höchste if-Verschachtelung; nginx-SSI erlaubt kein if in if. */
function maxIfDepth(html: string): number {
  let depth = 0
  let max = 0
  for (const [, cmd] of html.matchAll(/<!--# (if|endif) /g)) {
    depth += cmd === 'if' ? 1 : -1
    max = Math.max(max, depth)
    if (depth < 0) return -1
  }
  return depth === 0 ? max : -1
}

describe('buildSsiHead', () => {
  const block = buildSsiVars() + buildSsiHead(t)

  it('nutzt nur nginx-taugliche Ausdrücke (kein &&, kein Apache-%{}, kein if in if)', () => {
    expect(block).not.toContain('&&')
    expect(block).not.toContain('%{')
    expect(maxIfDepth(block)).toBe(1)
    // `$` steht in Ausdrücken nur für Variablen; das Regex-Ende ist \z
    for (const [, expr] of block.matchAll(/expr="([^"]*)"/g)) {
      expect(expr!.replace(/\$(request_uri|pg_[a-z]+)/g, '')).not.toContain('$')
    }
  })

  it('hat für jede Route einen EN- und einen DE-Zweig', () => {
    for (const key of Object.keys(PAGES)) {
      expect(block).toContain(`expr="$pg_k = en_${key}"`)
      expect(block).toContain(`expr="$pg_k = de_${key}"`)
    }
  })

  it('zeigt ohne SSI genau einen Satz Tags: Deutsch, Startseite', () => {
    const plain = withoutSsi(block)
    expect(count(plain, /<title>/g)).toBe(1)
    expect(count(plain, /rel='canonical'/g)).toBe(1)
    expect(plain).toContain(`<title>${de.meta_title_landing}</title>`)
    expect(plain).toContain("href='https://kodinitools.com/playlist_generator/' />")
  })

  it('bricht ab, wenn ein Wert das nginx-Limit von 256 Byte überschreitet', () => {
    const long = { ...de, meta_description_faq: 'ä'.repeat(130) }
    expect(() => buildSsiHead({ de: long, en })).toThrow(/nginx-Limit/)
  })
})

describe('applySsiHead', () => {
  it('ersetzt Marker und <html lang> in index.html', () => {
    const out = applySsiHead(indexHtml(), t)
    expect(out).not.toContain(SEO_HEAD_START)
    expect(out).not.toContain(SEO_HEAD_END)
    expect(out).toContain(`<!--# set var="pg_html" value="<html lang='en'>" -->`)
    expect(maxIfDepth(out)).toBe(1)
    // Ohne SSI: weiterhin genau ein <html lang="de"> und ein Titel
    const plain = withoutSsi(out)
    expect(count(plain, /<html lang="de">/g)).toBe(1)
    expect(count(plain, /<title>/g)).toBe(1)
    // SSI-Includes der Server-Navigation bleiben unangetastet
    expect(out).toContain('<!--#include virtual="/partials/nav.html" -->')
  })

  it('bricht ab, wenn die Marker fehlen (kein stiller Build ohne SEO-Head)', () => {
    expect(() => applySsiHead('<html lang="de"><head></head></html>', t)).toThrow(/Marker/)
  })
})

/**
 * Wertet `set`-Befehle wie nginx aus (Maskierung `\\x` → `x`, `${var}` → Wert),
 * um das JSON-LD eines Zweigs ohne Server zu prüfen.
 */
function ssiValue(raw: string, vars: Record<string, string>): string {
  return raw.replace(/\\(.)|\$\{(\w+)\}/g, (_, escaped: string, name: string) =>
    escaped !== undefined ? escaped : (vars[name] ?? ''),
  )
}

function ldFor(key: string, lang: 'de' | 'en', translations = t): unknown {
  const block = buildSsiHead(translations)
  const vars: Record<string, string> = { pg_l: lang, pg_q: lang === 'en' ? '?lang=en' : '' }
  const branch = block
    .split(/<!--# (?:if|elif|endif)/)
    .find((part) => part.startsWith(` expr="$pg_k = ${lang}_${key}"`))!
  const tail = block.slice(block.lastIndexOf('<!--# endif -->', block.indexOf('pg_ju')))
  for (const part of [branch, tail]) {
    for (const [, name, value] of part.matchAll(/set var="(\w+)" value="((?:\\.|[^"\\])*)"/g)) {
      vars[name!] = ssiValue(value!, vars)
    }
  }
  const html = vars.pg_ty ? vars.pg_ld! : ''
  const json = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/)?.[1]
  return json === undefined ? null : JSON.parse(json)
}

describe('strukturierte Daten (JSON-LD)', () => {
  it.each(['de', 'en'] as const)('%s: SSI liefert je Seite dasselbe wie structuredData', (lang) => {
    for (const [key, page] of Object.entries(PAGES)) {
      expect(ldFor(key, lang)).toEqual(structuredData(page, lang, (k) => t[lang][k]))
    }
  })

  it('gibt es nur für Startseite, App und Download; URL ist die kanonische der Sprache', () => {
    expect(ldFor('faq', 'de')).toBeNull()
    expect(ldFor('blog', 'en')).toBeNull()
    expect(ldFor('app', 'en')).toMatchObject({
      '@type': 'WebApplication',
      url: 'https://kodinitools.com/playlist_generator/app?lang=en',
      inLanguage: 'en',
    })
    expect(ldFor('download', 'de')).toMatchObject({
      '@type': 'SoftwareApplication',
      name: de.download_title,
      operatingSystem: 'Windows 10, Windows 11',
    })
  })

  it('enthält keine unbelegten Angaben (keine Bewertung, keine Version)', () => {
    const data = structuredData(PAGES.landing!, 'de', (k) => de[k])!
    expect(Object.keys(data).sort()).toEqual(
      [
        '@context',
        '@type',
        'applicationCategory',
        'description',
        'inLanguage',
        'isAccessibleForFree',
        'name',
        'offers',
        'operatingSystem',
        'publisher',
        'url',
      ].sort(),
    )
  })

  it('übersteht Sonderzeichen: Anführungszeichen, $, Backslash, </script>', () => {
    const tricky = { ...de, meta_description_landing: `"A" & $pg_l \\ </script> it's` }
    const translations = { de: tricky, en }
    expect(ldFor('landing', 'de', translations)).toEqual(
      structuredData(PAGES.landing!, 'de', (k) => tricky[k]),
    )
    expect(buildSsiHead(translations)).not.toMatch(/<\/script>[^"]*<\/script>/)
  })

  it('hält jedes Stück unter dem nginx-Limit und trennt keine Variable oder Maskierung', () => {
    for (const limit of [255, 60]) {
      const chunks = ldChunks(limit)
      for (const chunk of chunks) {
        expect(new TextEncoder().encode(chunk).length).toBeLessThanOrEqual(limit)
        expect(chunk).not.toMatch(/\\$/)
        expect(chunk.replace(/\$\{\w+\}/g, '').replace(/\\\$/g, '')).not.toContain('$')
      }
      expect(chunks.join('')).toBe(ldChunks(100000)[0])
    }
  })

  it('index.html (Entwicklung, Desktop) trägt das JSON-LD der deutschen Startseite', () => {
    const json = indexHtml().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    expect(JSON.parse(json!)).toEqual(structuredData(PAGES.landing!, 'de', (k) => de[k]))
    expect(jsonForScript({ a: '</script>&' })).toBe('{"a":"\\u003c/script\\u003e\\u0026"}')
  })

  it('zeigt ohne SSI genau ein JSON-LD-Element', () => {
    const plain = withoutSsi(applySsiHead(indexHtml(), t))
    expect(count(plain, /application\/ld\+json/g)).toBe(1)
  })
})
