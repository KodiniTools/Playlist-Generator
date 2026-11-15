import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import de from '../../i18n/de'
import en from '../../i18n/en'
import { PAGES } from '../pageMeta'
import { SEO_HEAD_END, SEO_HEAD_START, applySsiHead, buildSsiHead, headTags } from '../ssiHead'

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
    expect(tags).not.toContain('"')
  })
})

describe('buildSsiHead', () => {
  const block = buildSsiHead(t)

  it('hat für jede Route eine EN- und (außer Startseite) eine DE-Bedingung', () => {
    for (const page of Object.values(PAGES)) {
      expect(block).toContain(
        `href='https://kodinitools.com/playlist_generator${page.path}?lang=en'`,
      )
    }
    expect(count(block, /<!--#if /g)).toBe(2)
    expect(count(block, /<!--#elif /g)).toBe(2 * Object.keys(PAGES).length - 2)
    expect(count(block, /<!--#endif -->/g)).toBe(2)
  })

  it('zeigt ohne SSI genau einen Satz Tags: Deutsch, Startseite', () => {
    const plain = withoutSsi(block)
    expect(count(plain, /<title>/g)).toBe(1)
    expect(count(plain, /rel='canonical'/g)).toBe(1)
    expect(plain).toContain(`<title>${de.meta_title_landing}</title>`)
    expect(plain).toContain("href='https://kodinitools.com/playlist_generator/' />")
  })
})

describe('applySsiHead', () => {
  it('ersetzt Marker und <html lang> in index.html', () => {
    const out = applySsiHead(indexHtml(), t)
    expect(out).not.toContain(SEO_HEAD_START)
    expect(out).not.toContain(SEO_HEAD_END)
    expect(out).toContain(`<!--#set var="pg_html" value="<html lang='en'>" -->`)
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
