import { storeToRefs } from 'pinia'
import { usePlaylistStore } from '../stores/playlist'

export type {
  AddFilesResult,
  FillMode,
  HistoryLabel,
  OpenPlaylistResult,
  OutputFormat,
  PathMode,
  SortOption,
} from '../stores/playlist'

/**
 * Zugriff auf den Playlist-Store mit Refs statt entpackter Werte, damit
 * Komponenten weiter `files.value` usw. schreiben können.
 */
export function usePlaylist() {
  const store = usePlaylistStore()
  const {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    pathMode,
    basePath,
    selectedFileIndex,
    excludedFiles,
    selectedCount,
    allSelected,
    someSelected,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
  } = storeToRefs(store)

  return {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    pathMode,
    basePath,
    selectedFileIndex,
    excludedFiles,
    isFileSelected: store.isFileSelected,
    selectedCount,
    allSelected,
    someSelected,
    toggleFileSelected: store.toggleFileSelected,
    setAllSelected: store.setAllSelected,
    fitToLength: store.fitToLength,
    openPlaylist: store.openPlaylist,
    addFiles: store.addFiles,
    clearFiles: store.clearFiles,
    removeFile: store.removeFile,
    moveFile: store.moveFile,
    sortFiles: store.sortFiles,
    applySortOption: store.applySortOption,
    setPlaylistName: store.setPlaylistName,
    setOutputFormat: store.setOutputFormat,
    setReplaceMode: store.setReplaceMode,
    setPathMode: store.setPathMode,
    setBasePath: store.setBasePath,
    generatePlaylist: store.generatePlaylist,
    // Undo / Redo
    undo: store.undo,
    redo: store.redo,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    clearHistory: store.clearHistory,
    savePlaylist: store.savePlaylist,
    handleSharedFiles: store.handleSharedFiles,
  }
}
