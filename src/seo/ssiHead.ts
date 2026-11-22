import type { Language } from '../composables/useTranslation'
import type { TranslationKey } from '../i18n/de'
import {
  PAGES,
  SITE_URL,
  alternateUrls,
  canonicalUrl,
  jsonForScript,
  structuredData,
  type PageMeta,
} from './pageMeta'

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
 * - Jeder `set`-Wert ist auf 256 Byte begrenzt: das JSON-LD (strukturierte Daten)
 *   wird deshalb in Stücken (`pg_j1` …) gesetzt und erst beim Ausgeben verkettet.
 * - In doppelt gequoteten Werten gilt nur `\\` als Maskierung (`\\"`, `\\$`, `\\\\`);
 *   `\\u…` bricht den Befehl ab, JSON-Escapes brauchen daher den doppelten Backslash.
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
  const data = structuredData(page, lang, (key) => t[lang][key])
  return [
    `<title>${esc(t[lang][page.title])}</title>`,
    `<meta name='description' content='${esc(t[lang][page.description])}' />`,
    `<link rel='canonical' href='${esc(canonicalUrl(page.path, lang))}' />`,
    links,
    ...(data ? [`${LD_OPEN}${jsonForScript(data)}${LD_CLOSE}`] : []),
  ].join('\n    ')
}

/** Rahmen des JSON-LD-Elements; `usePageMeta` findet es im Browser über den Typ. */
const LD_OPEN = '<script type="application/ld+json">'
const LD_CLOSE = '</script>'

/** Maskiert Text für einen doppelt gequoteten SSI-Wert, der unverändert ausgegeben wird. */
function ssiRaw(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')
}

/** JSON-Zeichenketteninhalt (ohne Anführungszeichen), tauglich für `<script>` und SSI. */
function ssiJsonText(text: string): string {
  return ssiRaw(jsonForScript(text).slice(1, -1))
}

/** Platzhalter im JSON-LD-Gerüst und die SSI-Variable, die ihn zur Laufzeit füllt. */
const LD_VARS = {
  type: 'pg_ty',
  name: 'pg_n',
  url: 'pg_ju',
  lang: 'pg_l',
  description: 'pg_jd',
  os: 'pg_os',
} as const
const mark = (key: string) => `@@${key}@@`

/**
 * JSON-LD-Gerüst als SSI-Wert: dieselbe Struktur wie `structuredData`, die
 * seitenabhängigen Werte sind Variablen. Zerlegt in Stücke unter dem nginx-Limit,
 * ohne eine Variable (`${…}`) oder eine Maskierung (`\\x`) zu trennen.
 */
export function ldChunks(limit: number = SSI_VALUE_LIMIT): string[] {
  const skeleton = structuredData(
    {
      title: 'meta_title_landing',
      description: mark('description') as TranslationKey,
      path: '/',
      schema: {
        type: mark('type') as 'WebApplication',
        name: mark('name') as TranslationKey,
        operatingSystem: mark('os'),
      },
    },
    mark('lang') as Language,
    (key) => key,
    mark('url'),
  )
  let value = ssiRaw(`${LD_OPEN}${jsonForScript(skeleton)}${LD_CLOSE}`)
  for (const [key, name] of Object.entries(LD_VARS)) {
    value = value.replace(mark(key), `\${${name}}`)
  }
  const tokens = value.match(/\$\{[a-z_0-9]+\}|\\.|[^\\$]+|\$/g) ?? []
  const size = (text: string) => new TextEncoder().encode(text).length
  const chunks: string[] = []
  let current = ''
  for (const token of tokens.flatMap((tk) =>
    tk.startsWith('${') || tk.startsWith('\\') ? [tk] : [...tk],
  )) {
    if (size(current + token) > limit) {
      chunks.push(current)
      current = ''
    }
    current += token
  }
  if (current) chunks.push(current)
  return chunks
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
      ssiSet('pg_ty', '') +
      ssiSet('pg_ld', '') +
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
 * und Route setzt Titel (`pg_t`), Description (`pg_d`) und Pfad (`pg_p`), bei
 * Seiten mit strukturierten Daten zusätzlich Typ, Name, Beschreibung und System;
 * Canonical, hreflang und JSON-LD entstehen daraus. Unbekannte Pfade gelten als Startseite.
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
          ssiSet('pg_p', page.path) +
          (page.schema
            ? ssiSet('pg_ty', page.schema.type) +
              ssiSet('pg_n', ssiJsonText(t[lang][page.schema.name])) +
              ssiSet('pg_jd', ssiJsonText(t[lang][page.description])) +
              ssiSet('pg_os', ssiJsonText(page.schema.operatingSystem))
            : ''),
      )
    }
  }
  const chunks = ldChunks()
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
    // Strukturierte Daten nur für Seiten mit `schema`; URL = Canonical der Sprachfassung
    '<!--# if expr="$pg_ty" -->' +
      ssiSet('pg_ju', '${pg_u}${pg_q}') +
      chunks.map((chunk, i) => ssiSet(`pg_j${i + 1}`, chunk)).join('') +
      ssiSet('pg_ld', chunks.map((_, i) => `\${pg_j${i + 1}}`).join('')) +
      '<!--# endif -->',
    '<!--# if expr="$pg_t" -->' +
      ssiSet('pg_head', '${pg_t}${pg_d}${pg_a1}${pg_a2}${pg_ld}') +
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
