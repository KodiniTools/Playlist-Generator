import type { Language } from '../composables/useTranslation'
import type { TranslationKey } from '../i18n/de'
import { PAGES, SITE_URL, alternateUrls, canonicalUrl, type PageMeta } from './pageMeta'

/**
 * Serverseitiger `<head>` je Sprache und Route über nginx-SSI (`ssi on`).
 *
 * Der Server liefert für alle Routen dieselbe index.html aus (try_files-Fallback).
 * Ohne diesen Block sehen Crawler ohne JavaScript unter `?lang=en` deutschen Titel,
 * deutsche Description und ein Canonical auf die deutsche URL. Der Web-Build
 * ersetzt deshalb den Bereich zwischen den Markern durch SSI-Befehle, die Titel,
 * Description, Canonical, hreflang und `<html lang>` passend setzen.
 *
 * Grenzen von nginx-SSI, nach denen der Block gebaut ist:
 * - kein `&&` und kein `if` in `if`: Sprache und Route landen erst in Variablen
 *   (`pg_l`, `pg_r`), der Schlüssel `pg_k` = `en_faq` usw. wählt dann flach aus.
 * - `$` ist in Ausdrücken immer eine Variable: Regex-Ende daher `\z`, Text-`$` als `&#36;`.
 * - `$arg_lang` fehlt nach dem try_files-Fallback (Query geht verloren); geprüft
 *   wird deshalb `$request_uri` (Original-URL mit Query).
 *
 * Ohne SSI (vite preview, Desktop) bleiben alle Befehle Kommentare: sichtbar
 * ist dann genau ein Satz Tags, nämlich der deutsche der Startseite.
 */

export const SEO_HEAD_START = '<!-- seo-head:start -->'
export const SEO_HEAD_END = '<!-- seo-head:end -->'

type Translations = Readonly<Record<Language, Readonly<Record<TranslationKey, string>>>>

/** HTML-Escaping für Text und einfach gequotete Attribute; `$` und `\` wegen SSI. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\$/g, '&#36;')
    .replace(/\\/g, '&#92;')
}

/** Head-Tags einer Seite in einer Sprache (Attribute einfach gequotet, SSI-tauglich). */
export function headTags(page: PageMeta, lang: Language, t: Translations): string {
  const links = alternateUrls(page.path)
    .map((a) => `<link rel='alternate' hreflang='${a.hreflang}' href='${esc(a.href)}' />`)
    .join('\n    ')
  return [
    `<title>${esc(t[lang][page.title])}</title>`,
    `<meta name='description' content='${esc(t[lang][page.description])}' />`,
    `<link rel='canonical' href='${esc(canonicalUrl(page.path, lang))}' />`,
    links,
  ].join('\n    ')
}

/** Base-Pfad der App für Regex (z. B. `\/playlist_generator`). */
const BASE_RE = new URL(SITE_URL).pathname.replace(/\//g, '\\/')

/** Routen-Schlüssel (Routenname aus PAGES) für den SSI-Schlüssel `pg_r`. */
const routeKeys = () => Object.entries(PAGES).filter(([, p]) => p.path !== '/')

/** nginx `ssi_value_length` (Standard 256 Byte) begrenzt jeden Parameter-Rohwert. */
export const SSI_VALUE_LIMIT = 255

/** `<!--# set -->` mit Längenprüfung, damit der Build statt der Live-Seite scheitert. */
function ssiSet(name: string, value: string): string {
  const bytes = new TextEncoder().encode(value).length
  if (bytes > SSI_VALUE_LIMIT) {
    throw new Error(`ssiHead: Wert für ${name} ist ${bytes} Byte lang (nginx-Limit 256)`)
  }
  return `<!--# set var="${name}" value="${value}" -->`
}

/**
 * Ermittelt `pg_l` (de|en), `pg_q` (Query fürs Canonical) und `pg_r`
 * (Routenname, Standard `landing`) aus `$request_uri` und setzt `pg_k`.
 * Steht vor `<html>`, damit auch `lang` passt.
 */
export function buildSsiVars(): string {
  const lines = [
    ssiSet('pg_l', 'de') +
      ssiSet('pg_q', '') +
      ssiSet('pg_r', 'landing') +
      ssiSet('pg_t', '') +
      ssiSet('pg_head', ''),
    `<!--# if expr="$request_uri = /[?&]lang=en(&|\\z)/" -->${ssiSet('pg_l', 'en')}${ssiSet('pg_q', '?lang=en')}<!--# endif -->`,
    ...routeKeys().map(
      ([key, p]) =>
        `<!--# if expr="$request_uri = /^${BASE_RE}${p.path.replace(/\//g, '\\/')}(\\?.*)?\\z/" -->${ssiSet('pg_r', key)}<!--# endif -->`,
    ),
    ssiSet('pg_k', '${pg_l}_${pg_r}'),
  ]
  return lines.join('\n')
}

/**
 * SSI-Block für den Bereich zwischen den Markern. Jede Kombination aus Sprache
 * und Route setzt Titel (`pg_t`), Description (`pg_d`) und Pfad (`pg_p`);
 * Canonical und hreflang entstehen daraus. Unbekannte Pfade gelten als Startseite.
 */
export function buildSsiHead(t: Translations): string {
  const chain: string[] = []
  for (const lang of ['en', 'de'] as const) {
    for (const [key, page] of Object.entries(PAGES)) {
      chain.push(
        `<!--# ${chain.length === 0 ? 'if' : 'elif'} expr="$pg_k = ${lang}_${key}" -->` +
          ssiSet('pg_t', `<title>${esc(t[lang][page.title])}</title>`) +
          ssiSet(
            'pg_d',
            `<meta name='description' content='${esc(t[lang][page.description])}' />`,
          ) +
          ssiSet('pg_p', page.path),
      )
    }
  }
  const link = (rel: string, href: string, hreflang?: string) =>
    `<link rel='${rel}'${hreflang ? ` hreflang='${hreflang}'` : ''} href='${href}' />`
  return [
    ...chain,
    '<!--# endif -->',
    ssiSet('pg_u', `${SITE_URL}\${pg_p}`),
    ssiSet('pg_a1', link('canonical', '${pg_u}${pg_q}') + link('alternate', '${pg_u}', 'de')),
    ssiSet(
      'pg_a2',
      link('alternate', '${pg_u}?lang=en', 'en') + link('alternate', '${pg_u}', 'x-default'),
    ),
    '<!--# if expr="$pg_t" -->' +
      ssiSet('pg_head', '${pg_t}${pg_d}${pg_a1}${pg_a2}') +
      '<!--# endif -->',
    '<!--# if expr="$pg_head" --><!--# echo var="pg_head" encoding="none" --><!--# else -->',
    headTags(PAGES.landing!, 'de', t),
    '<!--# endif -->',
  ].join('\n    ')
}

/** `<html lang>` passend zu `?lang=en`; ohne SSI bleibt `lang="de"`. */
export function buildSsiHtmlOpen(): string {
  return (
    `<!--# if expr="$pg_l = en" -->${ssiSet('pg_html', "<html lang='en'>")}` +
    `<!--# echo var="pg_html" encoding="none" --><!--# else --><html lang="de"><!--# endif -->`
  )
}

/**
 * Ersetzt in der gebauten index.html `<html lang="de">` und den Marker-Bereich.
 * Wirft, wenn etwas fehlt, damit ein Build nie still ohne SEO-Head ausgeliefert wird.
 */
export function applySsiHead(html: string, t: Translations): string {
  const start = html.indexOf(SEO_HEAD_START)
  const end = html.indexOf(SEO_HEAD_END)
  if (start < 0 || end < start) throw new Error('ssiHead: Marker seo-head fehlen in index.html')
  if (!html.includes('<html lang="de">')) throw new Error('ssiHead: <html lang="de"> fehlt')
  return (html.slice(0, start) + buildSsiHead(t) + html.slice(end + SEO_HEAD_END.length)).replace(
    '<html lang="de">',
    `${buildSsiVars()}\n${buildSsiHtmlOpen()}`,
  )
}
