import { ref, computed } from 'vue'
import { modifierLabel } from '../utils/platform'
import de, { type TranslationKey } from '../i18n/de'
import en from '../i18n/en'
import { navTranslations } from '../i18n/nav'
import { IS_DESKTOP } from '../utils/desktop'

export type Language = 'de' | 'en'

export const LANGUAGES: readonly Language[] = ['de', 'en']

/** Sprache aus `?lang=de|en`; null ohne oder bei unbekanntem Wert. */
export function languageFromSearch(search: string): Language | null {
  const lang = new URLSearchParams(search).get('lang')
  return LANGUAGES.find((l) => l === lang) ?? null
}

/** Systemsprache für den ersten Start der Desktop-App: Deutsch bei `de-*`, sonst Englisch. */
export function languageFromSystem(languages: readonly string[]): Language {
  return languages[0]?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export type { TranslationKey }

/** Übersetzt einen Schlüssel; unbekannte Schlüssel kommen unverändert zurück. */
export type Translate = (key: TranslationKey) => string

/** Übersetzungstabellen je Sprache; exportiert für Tests und Tooling. */
export const translations: Readonly<Record<Language, Readonly<Record<TranslationKey, string>>>> = {
  de,
  en,
}

// Read from 'locale' (global nav key) with fallback to 'playlist-generator-locale' / 'language' (legacy)
const storedLang =
  localStorage.getItem('locale') ||
  localStorage.getItem('playlist-generator-locale') ||
  localStorage.getItem('language')
// `?lang=` (Links aus Sitemap/hreflang) hat Vorrang vor der gespeicherten Sprache.
// Ohne beides gilt Deutsch: die URL ohne Parameter ist die deutsche Fassung
// (hreflang de/x-default), auch für Crawler mit englischer Browsersprache.
// Die Desktop-App hat keine URL-Fassungen und folgt beim ersten Start der Systemsprache.
const currentLanguage = ref<string>(
  languageFromSearch(location.search) ||
    LANGUAGES.find((l) => l === storedLang) ||
    (IS_DESKTOP ? languageFromSystem(navigator.languages ?? [navigator.language]) : 'de'),
)

// Ensure both keys are in sync on initialization
if (currentLanguage.value) {
  localStorage.setItem('locale', currentLanguage.value)
  localStorage.setItem('playlist-generator-locale', currentLanguage.value)
}

/**
 * Translate SSI nav elements that use data-nav-i18n attributes
 */
function translateExternalNav(lang: string) {
  const t = navTranslations[lang as Language]
  if (!t) return

  document.querySelectorAll('[data-nav-i18n]').forEach((el) => {
    const text = t[el.getAttribute('data-nav-i18n') ?? '']
    if (text) el.textContent = text
  })
  document.querySelectorAll('[data-nav-i18n-aria]').forEach((el) => {
    const text = t[el.getAttribute('data-nav-i18n-aria') ?? '']
    if (text) el.setAttribute('aria-label', text)
  })
  document.querySelectorAll('[data-nav-i18n-title]').forEach((el) => {
    const text = t[el.getAttribute('data-nav-i18n-title') ?? '']
    if (text) el.setAttribute('title', text)
  })
}

/**
 * Update ALL SSI-Partial elements for the given language.
 * Combines nav (data-nav-i18n), footer/cookie-banner (data-lang-*),
 * lang button active states, and language-changed event dispatch.
 */
function syncAllExternalElements(lang: string) {
  // 1. Nav elements: data-nav-i18n attributes
  translateExternalNav(lang)

  // 2. Footer/cookie-banner: data-lang-* attributes
  const attr = `data-lang-${lang}`
  document.querySelectorAll(`[${attr}]`).forEach((el) => {
    const text = el.getAttribute(attr)
    if (text) el.textContent = text
  })

  // 3. Lang button active states
  syncExternalLangButtons(lang)

  // 4. Dispatch event for footer/cookie-banner SSI scripts
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }))
}

/**
 * Sync the active state of external lang buttons in SSI nav
 */
function syncExternalLangButtons(lang: string) {
  document.querySelectorAll('.global-nav-lang-btn').forEach((btn) => {
    const btnLang = btn.getAttribute('data-lang')
    if (btnLang === lang) {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })
}

/**
 * Composable: provides reactive translations and language state.
 * setLanguage() includes SYNCHRONOUS SSI-Partial sync.
 *
 * NOTE: No interceptExternalLangSwitcher needed – the SSI nav's own
 * script does NOT cause a page reload. It translates the nav itself
 * and dispatches 'language-changed', which App.vue listens for.
 */
export function useTranslation() {
  // {mod} wird zur Befehlstaste des Systems (⌘ auf Apple-Geräten, sonst Strg/Ctrl).
  const t = computed<Translate>(() => {
    const mod = modifierLabel(currentLanguage.value)
    return (key) =>
      translations[currentLanguage.value as Language]?.[key]?.split('{mod}').join(mod) || key
  })

  const setLanguage = (lang: string) => {
    currentLanguage.value = lang
    // Dual-Key localStorage (global + app-specific + legacy)
    localStorage.setItem('locale', lang)
    localStorage.setItem('playlist-generator-locale', lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang

    // Synchronous SSI-Partial sync – runs immediately, no async watch needed
    syncAllExternalElements(lang)
  }

  return {
    currentLanguage,
    t,
    setLanguage,
    syncAllExternalElements,
  }
}
