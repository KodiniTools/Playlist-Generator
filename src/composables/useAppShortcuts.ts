import { onMounted, onUnmounted } from 'vue'
import { hasModifier } from '../utils/platform'

export interface AppShortcutHandlers {
  openFiles: () => void
  save: () => void
  copy: () => void
  deleteSelected: () => void
  undo: () => void
  redo: () => void
  /**
   * Markierung in der Dateiliste um `delta` verschieben (ArrowUp/-Down).
   * Gibt `false` zurück, wenn es nichts zu markieren gibt; dann scrollt die Seite normal.
   */
  moveSelection: (delta: 1 | -1) => boolean
  clearSelection: () => void
}

/**
 * Globale Kurzbefehle der App-Seite (Strg/⌘+O/S/C/Z/Y, Entf, Pfeile, Escape).
 * In Eingabefeldern greifen sie nicht. Die Dateiliste verarbeitet Pfeile, Entf
 * und Escape selbst, solange sie den Fokus hat, und reicht diese Tasten nicht weiter.
 */
export function useAppShortcuts(handlers: AppShortcutHandlers): void {
  const onKeyDown = (event: KeyboardEvent) => {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return
    }

    if (hasModifier(event) && event.key === 'o') {
      event.preventDefault()
      handlers.openFiles()
    }

    if (hasModifier(event) && event.key === 's') {
      event.preventDefault()
      handlers.save()
    }

    if (hasModifier(event) && event.key === 'c' && !window.getSelection()?.toString()) {
      event.preventDefault()
      handlers.copy()
    }

    if (event.key === 'Delete') {
      event.preventDefault()
      handlers.deleteSelected()
    }

    const key = event.key.toLowerCase()
    if (hasModifier(event) && key === 'z') {
      event.preventDefault()
      if (event.shiftKey) handlers.redo()
      else handlers.undo()
    } else if (hasModifier(event) && key === 'y') {
      event.preventDefault()
      handlers.redo()
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (handlers.moveSelection(event.key === 'ArrowDown' ? 1 : -1)) event.preventDefault()
    }

    if (event.key === 'Escape') {
      handlers.clearSelection()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}
