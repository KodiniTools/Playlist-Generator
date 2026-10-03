import type { ComputedRef } from 'vue'

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

/** Typdeklaration für useHistory.js (Schnappschuss-basiertes Undo/Redo). Wirft TypeError bei fehlendem capture/restore. */
export function createHistory<S>(options: HistoryOptions<S>): History
