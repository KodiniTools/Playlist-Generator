import type { ComputedRef, Ref } from 'vue'
import type { SharedFileRecord } from '../utils/sharedFileRepository'

export type SortOption = 'alphabetical' | 'date' | 'random' | 'manual'
export type OutputFormat = 'm3u' | 'm3u8' | 'pls' | 'txt' | 'cue' | 'csv' | 'json' | 'xspf'

export interface AddFilesResult {
  added: number
  skipped: number
}

/** Typdeklaration für usePlaylist.js (Singleton-Zustand der Wiedergabeliste). */
export function usePlaylist(): {
  files: Ref<File[]>
  sortOption: Ref<SortOption>
  playlistName: Ref<string>
  outputFormat: Ref<OutputFormat>
  playlistContent: Ref<string>
  replaceMode: Ref<boolean>
  selectedFileIndex: Ref<number>
  /** Dateien, die nicht in die Ausgabe aufgenommen werden. */
  excludedFiles: Ref<Set<File>>
  isFileSelected(file: File): boolean
  selectedCount: ComputedRef<number>
  allSelected: ComputedRef<boolean>
  someSelected: ComputedRef<boolean>
  toggleFileSelected(index: number): void
  setAllSelected(selected: boolean): void
  addFiles(fileList: Iterable<File> | ArrayLike<File>): AddFilesResult
  clearFiles(): void
  removeFile(index: number): void
  /** `toIndex` ist der Index im Endzustand. */
  moveFile(fromIndex: number, toIndex: number): void
  sortFiles(): void
  applySortOption(option: SortOption): void
  setPlaylistName(name: string): void
  setOutputFormat(format: OutputFormat): void
  setReplaceMode(enabled: boolean): void
  generatePlaylist(): void
  /** Liefert das Label des rückgängig gemachten Schritts, sonst einen falsy Wert. */
  undo(): string | null | undefined
  redo(): string | null | undefined
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  undoLabel: Ref<string>
  redoLabel: Ref<string>
  clearHistory(): void
  savePlaylist(): Promise<unknown>
  analyzeBlob(blob: Blob, name: string): Promise<unknown>
  handleSharedFiles(records: SharedFileRecord[]): Promise<{ processed: number }>
}
