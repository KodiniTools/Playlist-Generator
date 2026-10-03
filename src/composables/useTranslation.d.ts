import type { ComputedRef, Ref } from 'vue'

/** Übersetzungstabellen je Sprache (de, en); exportiert für Tests und Tooling. */
export const translations: Readonly<Record<'de' | 'en', Readonly<Record<string, string>>>>

/** Übersetzt einen Schlüssel; unbekannte Schlüssel kommen unverändert zurück. */
export type Translate = (key: string) => string

/** Typdeklaration für useTranslation.js (DE/EN, Singleton-Sprache). */
export function useTranslation(): {
  currentLanguage: Ref<string>
  t: ComputedRef<Translate>
  setLanguage(lang: string): void
  syncAllExternalElements(lang: string): void
}
