import { storeToRefs } from 'pinia'
import { usePlaylistStore } from '../stores/playlist'

export type { AddFilesResult, HistoryLabel, OutputFormat, SortOption } from '../stores/playlist'

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
    selectedFileIndex,
    excludedFiles,
    isFileSelected: store.isFileSelected,
    selectedCount,
    allSelected,
    someSelected,
    toggleFileSelected: store.toggleFileSelected,
    setAllSelected: store.setAllSelected,
    addFiles: store.addFiles,
    clearFiles: store.clearFiles,
    removeFile: store.removeFile,
    moveFile: store.moveFile,
    sortFiles: store.sortFiles,
    applySortOption: store.applySortOption,
    setPlaylistName: store.setPlaylistName,
    setOutputFormat: store.setOutputFormat,
    setReplaceMode: store.setReplaceMode,
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
    analyzeBlob: store.analyzeBlob,
    handleSharedFiles: store.handleSharedFiles,
  }
}
