import { watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useTranslation, type Language, type TranslationKey } from './useTranslation'

/** Öffentliche Adresse der App (ohne abschließenden Schrägstrich). */
export const SITE_URL = 'https://kodinitools.com/playlist_generator'

interface PageMeta {
  title: TranslationKey
  description: TranslationKey
  path: string
}

const PAGES: Record<string, PageMeta> = {
  landing: { title: 'meta_title_landing', description: 'meta_description_landing', path: '/' },
  app: { title: 'meta_title_app', description: 'meta_description_app', path: '/app' },
  faq: { title: 'meta_title_faq', description: 'meta_description_faq', path: '/faq' },
  blog: { title: 'meta_title_blog', description: 'meta_description_blog', path: '/blog' },
}

/**
 * Kanonische URL einer Seite. Mit `?lang=` bleibt die Sprache Teil der URL,
 * damit die hreflang-Alternativen aus der Sitemap auf sich selbst verweisen.
 */
export function canonicalUrl(path: string, lang: Language | null): string {
  return `${SITE_URL}${path}${lang ? `?lang=${lang}` : ''}`
}

/** Setzt `content`/`href` eines Head-Elements und legt es bei Bedarf an. */
function upsertHead(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function applyPageMeta(title: string, description: string, canonical: string): void {
  document.title = title
  upsertHead(
    'meta[name="description"]',
    () => Object.assign(document.createElement('meta'), { name: 'description' }),
    'content',
    description,
  )
  upsertHead(
    'link[rel="canonical"]',
    () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
    'href',
    canonical,
  )
}

const queryLang = (route: RouteLocationNormalizedLoaded) =>
  typeof route.query.lang === 'string' ? route.query.lang : null

/**
 * Hält Titel, Beschreibung, kanonische URL und `<html lang>` passend zu Route
 * und Sprache. Steht `?lang=` in der URL, folgt er einem Sprachwechsel.
 */
export function usePageMeta(): void {
  const route = useRoute()
  const router = useRouter()
  const { t, currentLanguage } = useTranslation()

  watch(
    [() => route.name, () => route.query.lang, currentLanguage],
    () => {
      const lang = currentLanguage.value as Language
      const inUrl = queryLang(route)
      if (inUrl !== null && inUrl !== lang) {
        void router.replace({ query: { ...route.query, lang } })
        return
      }
      if (document.documentElement.lang !== lang) document.documentElement.lang = lang
      const page = PAGES[String(route.name)]
      if (!page) return
      applyPageMeta(
        t.value(page.title),
        t.value(page.description),
        canonicalUrl(page.path, inUrl === null ? null : lang),
      )
    },
    { immediate: true },
  )
}
