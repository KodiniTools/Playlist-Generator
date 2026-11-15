import type { Language } from '../composables/useTranslation'
import type { TranslationKey } from '../i18n/de'

/**
 * Seiten-Metadaten ohne Vue-Abhängigkeit: genutzt von `usePageMeta` (Browser)
 * und vom Build (`ssiHead.ts`, serverseitiger `<head>` je Sprache und Route).
 */

/** Öffentliche Adresse der App (ohne abschließenden Schrägstrich). */
export const SITE_URL = 'https://kodinitools.com/playlist_generator'

export interface PageMeta {
  title: TranslationKey
  description: TranslationKey
  path: string
}

/** Indexierbare Seiten, Schlüssel = Routenname. */
export const PAGES: Readonly<Record<string, PageMeta>> = {
  landing: { title: 'meta_title_landing', description: 'meta_description_landing', path: '/' },
  app: { title: 'meta_title_app', description: 'meta_description_app', path: '/app' },
  faq: { title: 'meta_title_faq', description: 'meta_description_faq', path: '/faq' },
  blog: { title: 'meta_title_blog', description: 'meta_description_blog', path: '/blog' },
  download: {
    title: 'meta_title_download',
    description: 'meta_description_download',
    path: '/download',
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
