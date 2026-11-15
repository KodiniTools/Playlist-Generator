import type { Language } from '../composables/useTranslation'
import type { TranslationKey } from '../i18n/de'
import { PAGES, SITE_URL, alternateUrls, canonicalUrl, type PageMeta } from './pageMeta'

/**
 * Serverseitiger `<head>` je Sprache und Route über Apache-SSI (mod_include).
 *
 * Der Server liefert für alle Routen dieselbe index.html aus. Ohne diesen Block
 * sehen Crawler ohne JavaScript unter `?lang=en` deutschen Titel, deutsche
 * Description und ein Canonical auf die deutsche URL. Der Build ersetzt deshalb
 * den Bereich zwischen den Markern in index.html durch SSI-Bedingungen, die
 * Titel, Description, Canonical und hreflang passend zu `?lang=en` und Pfad setzen.
 *
 * Ohne SSI (vite preview, Desktop) bleiben alle Direktiven Kommentare: sichtbar
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

const EN = '%{QUERY_STRING} =~ /(^|&)lang=en(&|$)/'

/** Bedingung „Anfrage geht an diese Route“ (THE_REQUEST ist unabhängig von Rewrites). */
function routeExpr(path: string): string {
  const base = new URL(SITE_URL).pathname // z. B. /playlist_generator
  const target = path === '/' ? `${base}/` : `${base}${path}`
  return `%{THE_REQUEST} =~ m#^\\S+ ${target}(\\?\\S*)? #`
}

/**
 * SSI-Block für den Bereich zwischen den Markern. Unbekannte Pfade fallen auf die
 * Startseite der jeweiligen Sprache zurück (wie bisher die statische index.html).
 */
export function buildSsiHead(t: Translations): string {
  const landing = PAGES.landing!
  const routes = Object.values(PAGES).filter((p) => p.path !== '/')
  const branches: [expr: string, body: string][] = []
  const set = (lang: Language, page: PageMeta) =>
    `<!--#set var="pg_head" value="${headTags(page, lang, t)}" -->`

  for (const page of routes) branches.push([`${EN} && ${routeExpr(page.path)}`, set('en', page)])
  branches.push([EN, set('en', landing)])
  for (const page of routes) branches.push([routeExpr(page.path), set('de', page)])

  const chain = branches
    .map(([expr, body], i) => `<!--#${i === 0 ? 'if' : 'elif'} expr="${expr}" -->${body}`)
    .join('\n    ')

  return [
    chain,
    '<!--#endif -->',
    `<!--#if expr="v('pg_head') != ''" --><!--#echo encoding="none" var="pg_head" --><!--#else -->`,
    `${headTags(landing, 'de', t)}`,
    '<!--#endif -->',
  ].join('\n    ')
}

/** `<html lang>` passend zu `?lang=en`; ohne SSI bleibt `lang="de"`. */
export function buildSsiHtmlOpen(): string {
  return (
    `<!--#if expr="${EN}" --><!--#set var="pg_html" value="<html lang='en'>" -->` +
    `<!--#echo encoding="none" var="pg_html" --><!--#else --><html lang="de"><!--#endif -->`
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
    buildSsiHtmlOpen(),
  )
}
