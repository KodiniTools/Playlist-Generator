import { watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useTranslation, type Language } from './useTranslation'
import { PAGES, alternateUrls, canonicalUrl, structuredData } from '../seo/pageMeta'

export { SITE_URL, alternateUrls, canonicalUrl } from '../seo/pageMeta'

/** Setzt `content`/`href` eines Head-Elements und legt es bei Bedarf an. */
function upsertHead(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function applyPageMeta(
  title: string,
  description: string,
  canonical: string,
  alternates: { hreflang: string; href: string }[] = [],
): void {
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
  for (const { hreflang, href } of alternates) {
    upsertHead(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
      () => Object.assign(document.createElement('link'), { rel: 'alternate', hreflang }),
      'href',
      href,
    )
  }
}

const LD_SELECTOR = 'script[type="application/ld+json"]'

/**
 * Setzt das JSON-LD der Seite (schema.org) oder entfernt es, wenn die Seite
 * keine strukturierten Daten hat. Übernimmt das vom Server gelieferte Element.
 */
export function applyStructuredData(data: Record<string, unknown> | null): void {
  const existing = document.head.querySelector<HTMLScriptElement>(LD_SELECTOR)
  if (data === null) {
    existing?.remove()
    return
  }
  const el =
    existing ??
    document.head.appendChild(
      Object.assign(document.createElement('script'), { type: 'application/ld+json' }),
    )
  // textContent wird nicht als HTML geparst: reines JSON genügt
  el.textContent = JSON.stringify(data)
}

const queryLang = (route: RouteLocationNormalizedLoaded) =>
  typeof route.query.lang === 'string' ? route.query.lang : null

/**
 * Hält Titel, Beschreibung, kanonische URL, JSON-LD und `<html lang>` passend zu Route
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
      const canonical = canonicalUrl(page.path, inUrl === null ? null : lang)
      applyPageMeta(
        t.value(page.title),
        t.value(page.description),
        canonical,
        alternateUrls(page.path),
      )
      applyStructuredData(structuredData(page, lang, t.value, canonical))
    },
    { immediate: true },
  )
}
