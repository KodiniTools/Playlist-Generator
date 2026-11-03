import { useToast } from './useToast'
import { useTranslation, type TranslationKey } from './useTranslation'
import { useUndoRedo } from './useUndoRedo'

/**
 * Toast mit „Rückgängig“-Button nach destruktiven Aktionen. Es gibt immer nur
 * einen, damit sich der Button stets auf den letzten Schritt bezieht; Undo und
 * Redo über Tastatur oder Kopfzeile schließen ihn.
 */
export function useUndoToast() {
  const { t } = useTranslation()
  const toast = useToast()
  const { performUndo, performRedo } = useUndoRedo()
  let undoToastId: number | null = null

  const dismissUndoToast = () => {
    if (undoToastId !== null) toast.removeToast(undoToastId)
    undoToastId = null
  }

  const showUndoToast = (messageKey: TranslationKey) => {
    dismissUndoToast()
    undoToastId = toast.addToast(t.value(messageKey), 'info', 5000, {
      label: t.value('toast_undo_btn'),
      callback: () => {
        undoToastId = null
        performUndo()
      },
    })
  }

  const undo = () => {
    dismissUndoToast()
    performUndo()
  }

  const redo = () => {
    dismissUndoToast()
    performRedo()
  }

  return { showUndoToast, dismissUndoToast, undo, redo }
}
