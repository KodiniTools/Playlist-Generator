import type { Language } from '../composables/useTranslation'
import type { TranslationKey } from '../i18n/de'

/**
 * Seiten-Metadaten ohne Vue-Abhängigkeit: genutzt von `usePageMeta` (Browser)
 * und vom Build (`ssiHead.ts`, serverseitiger `<head>` je Sprache und Route).
 */

/** Öffentliche Adresse der App (ohne abschließenden Schrägstrich). */
export const SITE_URL = 'https://kodinitools.com/playlist_generator'

/** Strukturierte Daten (schema.org) einer Seite; nur Angaben, die die Seite selbst belegt. */
export interface PageSchema {
  type: 'WebApplication' | 'SoftwareApplication'
  /** Sichtbarer Name der Anwendung (Überschrift der Seite). */
  name: TranslationKey
  operatingSystem: string
}

export interface PageMeta {
  title: TranslationKey
  description: TranslationKey
  path: string
  /** Fehlt bei Seiten ohne belegbare strukturierte Daten (FAQ, Blog). */
  schema?: PageSchema
}

/** Browser-App: läuft in jedem aktuellen Browser, daher kein bestimmtes Betriebssystem. */
const WEB_APP: PageSchema = { type: 'WebApplication', name: 'hero_title', operatingSystem: 'Any' }

/** Indexierbare Seiten, Schlüssel = Routenname. */
export const PAGES: Readonly<Record<string, PageMeta>> = {
  landing: {
    title: 'meta_title_landing',
    description: 'meta_description_landing',
    path: '/',
    schema: WEB_APP,
  },
  app: {
    title: 'meta_title_app',
    description: 'meta_description_app',
    path: '/app',
    schema: WEB_APP,
  },
  faq: { title: 'meta_title_faq', description: 'meta_description_faq', path: '/faq' },
  blog: { title: 'meta_title_blog', description: 'meta_description_blog', path: '/blog' },
  download: {
    title: 'meta_title_download',
    description: 'meta_description_download',
    path: '/download',
    schema: {
      type: 'SoftwareApplication',
      name: 'download_title',
      operatingSystem: 'Windows 10, Windows 11',
    },
  },
}

/**
 * Kanonische URL einer Seite: Deutsch ohne Parameter, Englisch mit `?lang=en`,
 * damit die hreflang-Alternativen aus der Sitemap auf sich selbst verweisen.
 */
export function canonicalUrl(path: string, lang: Language | null): string {
  return `${SITE_URL}${path}${lang === 'en' ? '?lang=en' : ''}`
}

/** hreflang-Ziele einer Seite (de, en, x-default = de). */
export function alternateUrls(path: string): { hreflang: string; href: string }[] {
  return [
    { hreflang: 'de', href: canonicalUrl(path, 'de') },
    { hreflang: 'en', href: canonicalUrl(path, 'en') },
    { hreflang: 'x-default', href: canonicalUrl(path, 'de') },
  ]
}

/** Feste Teile der strukturierten Daten (für Browser und SSI-Head identisch). */
export const SCHEMA_CONTEXT = 'https://schema.org'
export const SCHEMA_CATEGORY = 'MultimediaApplication'
export const SCHEMA_OFFER = { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } as const
export const SCHEMA_PUBLISHER = {
  '@type': 'Organization',
  name: 'KodiniTools',
  url: 'https://kodinitools.com/',
} as const

/**
 * JSON-LD einer Seite in einer Sprache oder `null`, wenn die Seite keine
 * strukturierten Daten hat. `url` ist die kanonische URL der Sprachfassung.
 * Die Reihenfolge der Schlüssel entspricht dem SSI-Head (`ssiHead.ts`).
 */
export function structuredData(
  page: PageMeta,
  lang: Language,
  translate: (key: TranslationKey) => string,
  url: string = canonicalUrl(page.path, lang),
): Record<string, unknown> | null {
  if (!page.schema) return null
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': page.schema.type,
    name: translate(page.schema.name),
    url,
    inLanguage: lang,
    description: translate(page.description),
    applicationCategory: SCHEMA_CATEGORY,
    operatingSystem: page.schema.operatingSystem,
    isAccessibleForFree: true,
    offers: SCHEMA_OFFER,
    publisher: SCHEMA_PUBLISHER,
  }
}

/** JSON für ein `<script>`-Element: `<`, `>` und `&` als Unicode-Escape. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
