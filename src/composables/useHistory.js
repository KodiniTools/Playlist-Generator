import { shallowRef, computed } from 'vue'

/**
 * Generic snapshot-based undo/redo history.
 *
 * The caller provides `capture()` (returns an immutable snapshot of the
 * current state) and `restore(snapshot)` (applies a snapshot). Every undoable
 * action calls `record(label)` BEFORE mutating the state; the label describes
 * the action that follows (used for tooltips / toasts).
 *
 * Entries are stored in shallow refs so that large snapshots (e.g. arrays of
 * File objects) are not made deeply reactive.
 *
 * @param {object} options
 * @param {() => any} options.capture
 * @param {(snapshot: any) => void} options.restore
 * @param {number} [options.limit=50]  max number of undo steps kept
 * @param {number} [options.coalesceWindow=1000]  ms within which consecutive
 *   records with the same `coalesceKey` are merged into one step (typing)
 */
export function createHistory({ capture, restore, limit = 50, coalesceWindow = 1000 }) {
  if (typeof capture !== 'function' || typeof restore !== 'function') {
    throw new TypeError('createHistory: capture and restore must be functions')
  }

  /** @type {import('vue').ShallowRef<Array<{label: string, coalesceKey: string|null, snapshot: any, at: number}>>} */
  const past = shallowRef([])
  const future = shallowRef([])
  let applying = false

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)
  const undoLabel = computed(() => past.value[past.value.length - 1]?.label ?? null)
  const redoLabel = computed(() => future.value[future.value.length - 1]?.label ?? null)

  /**
   * Record the current state as the "before" of an action. Must be called
   * before the mutation. Any redo steps are discarded.
   */
  const record = (label, { coalesceKey = null } = {}) => {
    if (applying) return
    const now = Date.now()
    const top = past.value[past.value.length - 1]

    if (coalesceKey && top && top.coalesceKey === coalesceKey && now - top.at <= coalesceWindow) {
      // Merge into the previous step: keep its "before" snapshot, extend the window.
      past.value = [...past.value.slice(0, -1), { ...top, at: now }]
    } else {
      const next = [...past.value, { label, coalesceKey, snapshot: capture(), at: now }]
      past.value = next.length > limit ? next.slice(next.length - limit) : next
    }

    if (future.value.length) future.value = []
  }

  const move = (from, to) => {
    const entry = from.value[from.value.length - 1]
    if (!entry) return null

    from.value = from.value.slice(0, -1)
    to.value = [...to.value, { label: entry.label, coalesceKey: null, snapshot: capture(), at: 0 }]

    applying = true
    try {
      restore(entry.snapshot)
    } finally {
      applying = false
    }
    return entry.label
  }

  /** @returns {string|null} label of the undone action, or null if nothing to undo */
  const undo = () => move(past, future)
  /** @returns {string|null} label of the redone action, or null if nothing to redo */
  const redo = () => move(future, past)

  const clear = () => {
    past.value = []
    future.value = []
  }

  return {
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    record,
    undo,
    redo,
    clear,
    /** True while a snapshot is being restored (mutations are not recorded). */
    isApplying: () => applying,
  }
}
