import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import { saveFiles, saveMeta, loadState, clearState } from '../utils/playlistPersistence'
import { createHistory } from '../composables/useHistory'
import { useDurations } from '../composables/useDurations'
import { useTrackTags } from '../composables/useTrackTags'
import { compareByArtist } from '../utils/audioTags'
import { pickForTarget, type FillMode } from '../utils/targetLength'
import { estimateSeconds } from '../components/ui/fileListFormat'
import { probeAudio } from '../utils/probeAudio'
import { formatPlaylist } from '../utils/playlistFormats'
import { resolveTrackPaths, type PathMode } from '../utils/trackPath'
import type { SharedFileRecord } from '../utils/sharedFileRepository'

export type SortOption = 'alphabetical' | 'date' | 'artist' | 'random' | 'manual'
export type { PathMode } from '../utils/trackPath'
export type { FillMode } from '../utils/targetLength'
export type OutputFormat = 'm3u' | 'm3u8' | 'pls' | 'txt' | 'cue' | 'csv' | 'json' | 'xspf'

export interface OpenPlaylistResult {
  /** Einträge der Playlist, zu denen es eine Datei in der Liste gibt. */
  matched: number
  /** Alle Einträge der Playlist. */
  total: number
}

export interface AddFilesResult {
  added: number
  skipped: number
}

/** Undo-Schritte; jeder Wert braucht einen Übersetzungs-Schlüssel `history_<label>`. */
export type HistoryLabel =
  | 'files_added'
  | 'files_cleared'
  | 'file_removed'
  | 'file_moved'
  | 'sorted'
  | 'selection_changed'
  | 'name_changed'
  | 'format_changed'
  | 'replace_mode_changed'
  | 'path_mode_changed'
  | 'base_path_changed'
  | 'target_length_applied'
  | 'playlist_opened'

interface Snapshot {
  files: File[]
  excluded: Set<File>
  sortOption: SortOption
  playlistName: string
  outputFormat: OutputFormat
  replaceMode: boolean
  pathMode: PathMode
  basePath: string
}

// File System Access API (Chrome/Edge); not part of the standard DOM typings.
interface SaveFilePickerWindow {
  showSaveFilePicker(options: {
    suggestedName: string
    types: { description: string; accept: Record<string, string[]> }[]
  }): Promise<{
    createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }>
  }>
}

/**
 * Zustand der Wiedergabeliste (Dateien, Auswahl, Einstellungen, Undo/Redo,
 * IndexedDB-Persistenz). Die Watcher leben im Effect-Scope des Stores und
 * überdauern damit jede Komponente, die den Store zuerst benutzt.
 */
export const usePlaylistStore = defineStore('playlist', () => {
  const { known: knownDurations, setDuration, getDuration } = useDurations()
  const { revision: tagRevision, getTags, readTags } = useTrackTags()
  const files = ref<File[]>([])
  const sortOption = ref<SortOption>('alphabetical')
  const playlistName = ref('meine_wiedergabeliste')
  const outputFormat = ref<OutputFormat>('m3u')
  const playlistContent = ref('')
  const replaceMode = ref(false)
  // Wie der Export auf Dateien verweist; siehe utils/trackPath.ts.
  const pathMode = ref<PathMode>('name')
  const basePath = ref('')
  const selectedFileIndex = ref(-1)
  // Files that are UNCHECKED (excluded from the generated playlist). Tracked by
  // File reference. Default = empty → every file is checked/included.
  const excludedFiles = ref(new Set<File>())

  // --- Undo / Redo ------------------------------------------------------------
  // Snapshot-based history over everything the user can change: file list and
  // order, checkbox selection, sort option, name, output format, replace mode.
  // Snapshots only hold references to the File objects (no blob copies).
  const captureSnapshot = (): Snapshot => ({
    files: files.value.slice(),
    excluded: new Set(excludedFiles.value),
    sortOption: sortOption.value,
    playlistName: playlistName.value,
    outputFormat: outputFormat.value,
    replaceMode: replaceMode.value,
    pathMode: pathMode.value,
    basePath: basePath.value,
  })

  const restoreSnapshot = (snapshot: Snapshot) => {
    files.value = snapshot.files.slice()
    excludedFiles.value = new Set(snapshot.excluded)
    sortOption.value = snapshot.sortOption
    playlistName.value = snapshot.playlistName
    outputFormat.value = snapshot.outputFormat
    replaceMode.value = snapshot.replaceMode
    pathMode.value = snapshot.pathMode
    basePath.value = snapshot.basePath
    // Keep the UI selection inside the (possibly shorter) list.
    if (selectedFileIndex.value >= files.value.length) {
      selectedFileIndex.value = files.value.length - 1
    }
    generatePlaylist()
  }

  const history = createHistory<Snapshot, HistoryLabel>({
    capture: captureSnapshot,
    restore: restoreSnapshot,
    limit: 50,
  })

  // The ordered subset of files that are checked and thus included in the output.
  const includedFiles = () => files.value.filter((f) => !excludedFiles.value.has(f))

  const isFileSelected = (file: File) => !excludedFiles.value.has(file)

  const selectedCount = computed(() =>
    files.value.reduce((n, f) => n + (excludedFiles.value.has(f) ? 0 : 1), 0),
  )
  const allSelected = computed(
    () => files.value.length > 0 && selectedCount.value === files.value.length,
  )
  const someSelected = computed(
    () => selectedCount.value > 0 && selectedCount.value < files.value.length,
  )

  const toggleFileSelected = (index: number) => {
    const file = files.value[index]
    if (!file) return
    history.record('selection_changed')
    const next = new Set(excludedFiles.value)
    if (next.has(file)) next.delete(file)
    else next.add(file)
    excludedFiles.value = next
    generatePlaylist()
  }

  const setAllSelected = (selected: boolean) => {
    if (files.value.length === 0) return
    history.record('selection_changed')
    excludedFiles.value = selected ? new Set<File>() : new Set(files.value)
    generatePlaylist()
  }

  /**
   * Setzt die Häkchen so, dass die Auswahl höchstens `targetSeconds` lang ist
   * (fehlende Dauern werden wie in der Dateiliste aus der Größe geschätzt).
   * Liefert die Zahl der gewählten Titel; 0 = nichts passt, nichts geändert.
   */
  const fitToLength = (targetSeconds: number, mode: FillMode): number => {
    const entries = files.value.map((file) => ({
      item: file,
      seconds: getDuration(file.name) ?? estimateSeconds(file.name, file.size),
    }))
    const picked = pickForTarget(entries, targetSeconds, mode)
    if (picked.size === 0) return 0
    // Gleiche Auswahl wie bisher: kein zusätzlicher Undo-Schritt.
    if (files.value.every((file) => picked.has(file) === !excludedFiles.value.has(file))) {
      return picked.size
    }
    history.record('target_length_applied')
    excludedFiles.value = new Set(files.value.filter((file) => !picked.has(file)))
    generatePlaylist()
    return picked.size
  }

  /**
   * Übernimmt eine geöffnete Playlist: gefundene Titel kommen in ihrer Reihenfolge
   * nach vorn und sind angehakt, alle übrigen hinten und abgewählt. Name und Format
   * werden übernommen. Zugeordnet wird über den Dateinamen (wie bei Duplikaten).
   * Ohne einen einzigen Treffer bleibt alles unverändert.
   */
  const openPlaylist = (
    entryNames: string[],
    name: string,
    format: OutputFormat,
  ): OpenPlaylistResult => {
    const byName = new Map(files.value.map((file) => [file.name.toLowerCase(), file]))
    const ordered: File[] = []
    for (const entry of entryNames) {
      const file = byName.get(entry.toLowerCase())
      if (file && !ordered.includes(file)) ordered.push(file)
    }
    const result = { matched: ordered.length, total: entryNames.length }
    if (ordered.length === 0) return result

    history.record('playlist_opened')
    const picked = new Set(ordered)
    const rest = files.value.filter((file) => !picked.has(file))
    files.value = [...ordered, ...rest]
    excludedFiles.value = new Set(rest)
    sortOption.value = 'manual'
    if (name) playlistName.value = name
    outputFormat.value = format
    generatePlaylist()
    return result
  }

  const supportedFormats = ['.mp3', '.wav', '.flac']

  const generatePlaylist = () => {
    // Only checked tracks are written to the playlist.
    const included = includedFiles()
    const paths = resolveTrackPaths(included, pathMode.value, basePath.value)
    const list = included.map((file, i) => ({
      file,
      path: paths[i] ?? file.name,
      duration: getDuration(file.name),
      tags: getTags(file),
    }))
    playlistContent.value = formatPlaylist(outputFormat.value, list, playlistName.value)
  }

  const addFiles = (fileList: Iterable<File> | ArrayLike<File>): AddFilesResult => {
    const validFiles = Array.from(fileList).filter((f) =>
      supportedFormats.some((ext) => f.name.toLowerCase().endsWith(ext)),
    )

    if (replaceMode.value) {
      // Replace mode: clear and add all new files (all checked by default)
      if (validFiles.length === 0 && files.value.length === 0) return { added: 0, skipped: 0 }
      history.record('files_added')
      excludedFiles.value = new Set<File>()
      files.value = validFiles
      sortFiles()
      generatePlaylist()
      return { added: validFiles.length, skipped: 0 }
    }

    // Append mode: check for duplicates by filename
    const existingNames = new Set(files.value.map((f) => f.name.toLowerCase()))
    const newFiles: File[] = []
    let skipped = 0

    for (const file of validFiles) {
      if (existingNames.has(file.name.toLowerCase())) {
        skipped++
      } else {
        newFiles.push(file)
        existingNames.add(file.name.toLowerCase())
      }
    }

    if (newFiles.length === 0) return { added: 0, skipped }

    history.record('files_added')
    files.value = [...files.value, ...newFiles]
    sortFiles()
    generatePlaylist()
    return { added: newFiles.length, skipped }
  }

  const clearFiles = () => {
    if (files.value.length === 0) return
    history.record('files_cleared')
    files.value = []
    excludedFiles.value = new Set<File>()
    playlistContent.value = ''
  }

  const removeFile = (index: number) => {
    if (index >= 0 && index < files.value.length) {
      const file = files.value[index]!
      history.record('file_removed')
      files.value.splice(index, 1)
      if (excludedFiles.value.has(file)) {
        const next = new Set(excludedFiles.value)
        next.delete(file)
        excludedFiles.value = next
      }
      generatePlaylist()
    }
  }

  /** `toIndex` ist der Index im Endzustand. */
  const moveFile = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= files.value.length) return
    if (toIndex < 0 || toIndex >= files.value.length) return
    if (fromIndex === toIndex) return

    history.record('file_moved')
    const [movedFile] = files.value.splice(fromIndex, 1)
    files.value.splice(toIndex, 0, movedFile!)

    // Switch to manual sort mode when user manually reorders
    sortOption.value = 'manual'
    generatePlaylist()
  }

  const sortFiles = () => {
    const option = sortOption.value
    // Manual mode: don't sort, keep user's order
    if (option === 'manual') {
      generatePlaylist()
      return
    }

    if (option === 'alphabetical') {
      files.value.sort((a, b) => a.name.localeCompare(b.name))
    } else if (option === 'date') {
      files.value.sort((a, b) => a.lastModified - b.lastModified)
    } else if (option === 'artist') {
      // Dateien ohne (gelesene) Tags landen hinten; sobald Tags eintreffen, wird neu sortiert.
      files.value.sort((a, b) =>
        compareByArtist({ name: a.name, tags: getTags(a) }, { name: b.name, tags: getTags(b) }),
      )
    } else if (option === 'random') {
      for (let i = files.value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[files.value[i], files.value[j]] = [files.value[j]!, files.value[i]!]
      }
    }
    generatePlaylist()
  }

  /** User picked a sort option: one undoable step for option + resulting order. */
  const applySortOption = (option: SortOption) => {
    history.record('sorted')
    sortOption.value = option
    sortFiles()
  }

  /** Consecutive keystrokes within 1 s are merged into a single undo step. */
  const setPlaylistName = (name: string) => {
    if (name === playlistName.value) return
    history.record('name_changed', { coalesceKey: 'playlistName' })
    playlistName.value = name
  }

  const setOutputFormat = (format: OutputFormat) => {
    if (format === outputFormat.value) return
    history.record('format_changed')
    outputFormat.value = format
  }

  const setReplaceMode = (enabled: boolean) => {
    if (enabled === replaceMode.value) return
    history.record('replace_mode_changed')
    replaceMode.value = enabled
  }
  const setPathMode = (mode: PathMode) => {
    if (mode === pathMode.value) return
    history.record('path_mode_changed')
    pathMode.value = mode
  }

  const setBasePath = (base: string) => {
    if (base === basePath.value) return
    history.record('base_path_changed', { coalesceKey: 'basePath' })
    basePath.value = base
  }

  const handleSharedFiles = async (sharedRecords: SharedFileRecord[]) => {
    let processed = 0

    for (const record of sharedRecords) {
      const blob =
        record.blob instanceof Blob
          ? record.blob
          : new Blob([record.blob], { type: record.mimeType || 'audio/wav' })

      if (blob.size === 0) continue

      try {
        // Nur Metadaten lesen: prüft, dass der Browser die Datei abspielen kann,
        // ohne sie komplett zu dekodieren.
        const duration = await probeAudio(blob)
        const file = new File([blob], record.name, {
          type: blob.type || 'audio/wav',
          lastModified: Date.now(),
        })
        // Check for duplicates
        const existingNames = new Set(files.value.map((f) => f.name.toLowerCase()))
        if (!existingNames.has(file.name.toLowerCase())) {
          // All shared files of one import form a single undo step.
          if (processed === 0) history.record('files_added')
          files.value = [...files.value, file]
          if (duration !== null) setDuration(file.name, duration)
          processed++
        }
      } catch (err) {
        console.warn('Could not process shared file:', record.name, err)
      }
    }

    if (processed > 0) {
      sortFiles()
      generatePlaylist()
    }

    return { processed }
  }

  /** true = gespeichert, false = Fehler oder nichts zu speichern, null = abgebrochen. */
  const savePlaylist = async (): Promise<boolean | null> => {
    if (!playlistContent.value) {
      return false
    }

    const formatDetails: Record<OutputFormat, { ext: string; mime: string }> = {
      m3u: { ext: '.m3u', mime: 'audio/x-mpegurl' },
      m3u8: { ext: '.m3u8', mime: 'application/vnd.apple.mpegurl' },
      pls: { ext: '.pls', mime: 'audio/x-scpls' },
      txt: { ext: '.txt', mime: 'text/plain' },
      cue: { ext: '.cue', mime: 'application/x-cue' },
      csv: { ext: '.csv', mime: 'text/csv' },
      json: { ext: '.json', mime: 'application/json' },
      xspf: { ext: '.xspf', mime: 'application/xspf+xml' },
    }

    const details = formatDetails[outputFormat.value]
    if (!details) return false

    const options = {
      suggestedName: `${playlistName.value}${details.ext}`,
      types: [
        {
          description: `${outputFormat.value.toUpperCase()} Playlist`,
          accept: { [details.mime]: [details.ext] },
        },
      ],
    }

    try {
      const handle = await (window as unknown as SaveFilePickerWindow).showSaveFilePicker(options)
      const writable = await handle.createWritable()
      await writable.write(playlistContent.value)
      await writable.close()
      return true
    } catch (err) {
      if ((err as Error | null)?.name !== 'AbortError') {
        console.error('Could not save the file:', err)
        return false
      }
      return null // User cancelled
    }
  }

  // --- Persistence: keep files + settings across reloads (all local) ---------
  let restoring = false
  let restored = false

  const excludedNamesOf = () =>
    files.value.filter((f) => excludedFiles.value.has(f)).map((f) => f.name)

  // Cheap, frequent write (settings + checkbox selection).
  let metaTimer: ReturnType<typeof setTimeout> | undefined
  const scheduleMetaSave = () => {
    if (restoring) return
    clearTimeout(metaTimer)
    metaTimer = setTimeout(() => {
      saveMeta({
        sortOption: sortOption.value,
        playlistName: playlistName.value,
        outputFormat: outputFormat.value,
        replaceMode: replaceMode.value,
        pathMode: pathMode.value,
        basePath: basePath.value,
        excludedNames: excludedNamesOf(),
      }).catch((e) => console.warn('Could not persist playlist settings:', e))
    }, 400)
  }

  // Heavier write — only when the set/order of files actually changes.
  let filesTimer: ReturnType<typeof setTimeout> | undefined
  const scheduleFilesSave = () => {
    if (restoring) return
    clearTimeout(filesTimer)
    filesTimer = setTimeout(() => {
      if (files.value.length === 0) {
        clearState().catch((e) => console.warn('Could not clear persisted playlist:', e))
        return
      }
      saveFiles(files.value).catch((e) => console.warn('Could not persist playlist files:', e))
      // File set changed → selection names may have changed too.
      scheduleMetaSave()
    }, 800)
  }

  async function restorePersistedState() {
    if (restored) return
    restored = true
    restoring = true
    try {
      const { meta, files: savedFiles } = await loadState()
      if (meta) {
        if (meta.sortOption) sortOption.value = meta.sortOption as SortOption
        if (typeof meta.playlistName === 'string') playlistName.value = meta.playlistName
        if (meta.outputFormat) outputFormat.value = meta.outputFormat as OutputFormat
        if (typeof meta.replaceMode === 'boolean') replaceMode.value = meta.replaceMode
        if (meta.pathMode === 'name' || meta.pathMode === 'relative') pathMode.value = meta.pathMode
        if (typeof meta.basePath === 'string') basePath.value = meta.basePath
      }
      if (savedFiles && savedFiles.length) {
        files.value = savedFiles
        const excludedNames = new Set((meta && meta.excludedNames) || [])
        excludedFiles.value = new Set(savedFiles.filter((f) => excludedNames.has(f.name)))
        generatePlaylist()
      }
      // Let the restore-triggered watchers flush while `restoring` is still true
      // so they don't immediately re-persist what we just loaded.
      await nextTick()
    } catch (e) {
      console.warn('Could not restore playlist state:', e)
    } finally {
      restoring = false
      // Note: restoring writes the refs directly (no history.record), so the
      // history is untouched — actions the user performed while the restore was
      // in flight stay undoable.
    }
  }

  watch(outputFormat, () => {
    if (files.value.length > 0) {
      generatePlaylist()
    }
  })

  // Laufzeiten werden asynchron gemessen; sobald sich eine ändert, Export auffrischen.
  watch(
    () => [...knownDurations.values()],
    () => {
      if (files.value.length > 0) generatePlaylist()
    },
  )

  // Tags asynchron lesen, sobald Dateien dazukommen (auch nach dem Wiederherstellen).
  watch(
    () => files.value.slice(),
    (list) => void readTags(list),
  )

  // Neue Tags ändern Titel im Export und bei „Interpret“ die Reihenfolge.
  watch(tagRevision, () => {
    if (files.value.length === 0) return
    if (sortOption.value === 'artist') sortFiles()
    else generatePlaylist()
  })

  watch([pathMode, basePath], () => {
    if (files.value.length > 0) generatePlaylist()
  })

  watch(playlistName, () => {
    // Only XSPF and CUE embed the playlist name in the output
    if (files.value.length > 0 && (outputFormat.value === 'xspf' || outputFormat.value === 'cue')) {
      generatePlaylist()
    }
  })

  // Persist on change. Files (heavy) only when the list itself changes;
  // settings + selection (cheap) on their own.
  watch(files, scheduleFilesSave, { deep: true })
  watch(
    [sortOption, playlistName, outputFormat, replaceMode, pathMode, basePath, excludedFiles],
    scheduleMetaSave,
  )

  // Restore any previously persisted playlist as soon as the app uses the store.
  void restorePersistedState()

  return {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    selectedFileIndex,
    excludedFiles,
    isFileSelected,
    selectedCount,
    allSelected,
    someSelected,
    toggleFileSelected,
    setAllSelected,
    fitToLength,
    openPlaylist,
    addFiles,
    clearFiles,
    removeFile,
    moveFile,
    sortFiles,
    applySortOption,
    setPlaylistName,
    setOutputFormat,
    setReplaceMode,
    pathMode,
    basePath,
    setPathMode,
    setBasePath,
    generatePlaylist,
    // Undo / Redo
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undoLabel: history.undoLabel,
    redoLabel: history.redoLabel,
    clearHistory: history.clear,
    savePlaylist,
    handleSharedFiles,
  }
})
