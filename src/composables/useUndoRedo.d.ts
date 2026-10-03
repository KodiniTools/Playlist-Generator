import type { ComputedRef, Ref } from 'vue'

/** Typdeklaration für useUndoRedo.js (Undo/Redo mit Toast-Rückmeldung). */
export function useUndoRedo(): {
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  undoTitle: ComputedRef<string>
  redoTitle: ComputedRef<string>
  /** true, wenn etwas rückgängig gemacht wurde. */
  performUndo(): boolean
  /** true, wenn etwas wiederholt wurde. */
  performRedo(): boolean
}
