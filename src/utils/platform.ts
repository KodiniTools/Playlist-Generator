/** Plattform-Erkennung für Tastenkürzel (⌘ auf Apple-Geräten, sonst Strg/Ctrl). */

type NavigatorWithUAData = Navigator & { userAgentData?: { platform?: string } }

/** true auf macOS, iPadOS und iOS. */
export function isApplePlatform(nav: Navigator | undefined = globalThis.navigator): boolean {
  if (!nav) return false
  const platform = (nav as NavigatorWithUAData).userAgentData?.platform || nav.platform || ''
  return /mac|iphone|ipad|ipod/i.test(platform)
}

/** Strg/Ctrl oder ⌘ gedrückt, damit Kürzel auf allen Systemen gleich funktionieren. */
export function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey
}

/** Beschriftung der Befehlstaste: ⌘ auf Apple-Geräten, sonst Strg (de) bzw. Ctrl. */
export function modifierLabel(lang: string, apple = isApplePlatform()): string {
  if (apple) return '⌘'
  return lang === 'de' ? 'Strg' : 'Ctrl'
}
