import { shallowRef, computed, type ComputedRef, type ShallowRef } from 'vue'

export interface HistoryOptions<S> {
  /** Liefert einen unveränderlichen Schnappschuss des aktuellen Zustands. */
  capture: () => S
  /** Wendet einen Schnappschuss wieder an. */
  restore: (snapshot: S) => void
  /** Maximale Anzahl gehaltener Undo-Schritte (Standard 50). */
  limit?: number
  /** Zeitfenster in ms, in dem aufeinanderfolgende Aufzeichnungen mit gleichem `coalesceKey` zu einem Schritt verschmelzen (Standard 1000). */
  coalesceWindow?: number
}

export interface RecordOptions {
  coalesceKey?: string | null
}

export interface History {
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  undoLabel: ComputedRef<string | null>
  redoLabel: ComputedRef<string | null>
  /** Vor der Mutation aufrufen; verwirft alle Redo-Schritte. Während `restore` läuft, wird nichts aufgezeichnet. */
  record(label: string, options?: RecordOptions): void
  /** Label des rückgängig gemachten Schritts, sonst null. */
  undo(): string | null
  /** Label des wiederholten Schritts, sonst null. */
  redo(): string | null
  clear(): void
  /** True, solange ein Schnappschuss wiederhergestellt wird. */
  isApplying(): boolean
}

interface Entry<S> {
  label: string
  coalesceKey: string | null
  snapshot: S
  at: number
}

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
 * Throws a TypeError when `capture` or `restore` is missing.
 */
export function createHistory<S>({
  capture,
  restore,
  limit = 50,
  coalesceWindow = 1000,
}: HistoryOptions<S>): History {
  if (typeof capture !== 'function' || typeof restore !== 'function') {
    throw new TypeError('createHistory: capture and restore must be functions')
  }

  const past = shallowRef<Entry<S>[]>([])
  const future = shallowRef<Entry<S>[]>([])
  let applying = false

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)
  const undoLabel = computed(() => past.value[past.value.length - 1]?.label ?? null)
  const redoLabel = computed(() => future.value[future.value.length - 1]?.label ?? null)

  /**
   * Record the current state as the "before" of an action. Must be called
   * before the mutation. Any redo steps are discarded.
   */
  const record = (label: string, { coalesceKey = null }: RecordOptions = {}) => {
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

  const move = (from: ShallowRef<Entry<S>[]>, to: ShallowRef<Entry<S>[]>): string | null => {
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

  /** Label of the undone action, or null if nothing to undo. */
  const undo = () => move(past, future)
  /** Label of the redone action, or null if nothing to redo. */
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
