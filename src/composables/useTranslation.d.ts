import type { ComputedRef, Ref } from 'vue'

/** Übersetzt einen Schlüssel; unbekannte Schlüssel kommen unverändert zurück. */
export type Translate = (key: string) => string

/** Typdeklaration für useTranslation.js (DE/EN, Singleton-Sprache). */
export function useTranslation(): {
  currentLanguage: Ref<string>
  t: ComputedRef<Translate>
  setLanguage(lang: string): void
  syncAllExternalElements(lang: string): void
}
