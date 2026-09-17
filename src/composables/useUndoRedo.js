import { computed } from 'vue'
import { usePlaylist } from './usePlaylist'
import { useToast } from './useToast'
import { useTranslation } from './useTranslation'

/**
 * Undo/redo with user feedback. Shared by the keyboard shortcuts (AppPage)
 * and the toolbar buttons (UndoRedoControls) so both behave identically.
 */
export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo, undoLabel, redoLabel } = usePlaylist()
  const toast = useToast()
  const { t } = useTranslation()

  const actionText = (label) => (label ? t.value(`history_${label}`) : '')

  const undoTitle = computed(() =>
    canUndo.value
      ? t.value('undo_title_with_action').replace('{action}', actionText(undoLabel.value))
      : t.value('undo_title'),
  )

  const redoTitle = computed(() =>
    canRedo.value
      ? t.value('redo_title_with_action').replace('{action}', actionText(redoLabel.value))
      : t.value('redo_title'),
  )

  /** @returns {boolean} whether something was undone */
  const performUndo = () => {
    const label = undo()
    if (!label) return false
    toast.info(t.value('toast_undo_done').replace('{action}', actionText(label)), 2500)
    return true
  }

  /** @returns {boolean} whether something was redone */
  const performRedo = () => {
    const label = redo()
    if (!label) return false
    toast.info(t.value('toast_redo_done').replace('{action}', actionText(label)), 2500)
    return true
  }

  return { canUndo, canRedo, undoTitle, redoTitle, performUndo, performRedo }
}
