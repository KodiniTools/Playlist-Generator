<template>
  <UiPanel class="playlist-config" :title="t('files_panel_title')" :count="files.length">
    <template #actions>
      <UndoRedoControls />
      <UiButton variant="secondary" @click="folderInputRef?.click()">
        <template #icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </template>
        {{ t('button_add_folder') }}
      </UiButton>
      <UiButton variant="primary" :title="t('shortcut_open')" @click="openFileDialog">
        <template #icon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </template>
        {{ t('button_add_files') }}
      </UiButton>
    </template>

    <div class="playlist-config__body">
      <!-- Versteckte Inputs: webkitdirectory muss beim Parsen im HTML stehen -->
      <input
        id="fileInput"
        ref="fileInputRef"
        type="file"
        class="playlist-config__input"
        multiple
        accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,.wma,.opus"
        tabindex="-1"
        @change="handleFileChange"
      />
      <input
        id="folderInput"
        ref="folderInputRef"
        type="file"
        class="playlist-config__input"
        webkitdirectory
        tabindex="-1"
        @change="handleFolderChange"
      />

      <div
        :class="[
          'playlist-config__dropzone',
          {
            'playlist-config__dropzone--over': isDragging && !isScanning,
            'playlist-config__dropzone--scanning': isScanning,
          },
        ]"
        :aria-busy="isScanning"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <template v-if="isScanning">
          <span class="playlist-config__spinner" aria-hidden="true"></span>
          <span class="playlist-config__dropzone-title" role="status">
            {{ t('scanning_folder') }}
            <span v-if="scanCount > 0" class="playlist-config__scan-count">{{ scanCount }}</span>
          </span>
        </template>
        <template v-else>
          <svg
            class="playlist-config__dropzone-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span class="playlist-config__dropzone-title">{{ t('drop_zone_title') }}</span>
          <span class="playlist-config__dropzone-hint">{{ t('drop_zone_hint') }}</span>
        </template>
      </div>

      <label v-if="files.length > 0" class="playlist-config__replace">
        <input
          type="checkbox"
          class="playlist-config__checkbox"
          :checked="replaceMode"
          @change="handleReplaceModeChange"
        />
        <span>{{ t('replace_list_option') }}</span>
      </label>

      <UiFileList
        :items="listItems"
        :checked="checkedIds"
        :selected-index="selectedFileIndex"
        :playing-index="playingIndex"
        :is-playing="isPlaying"
        :labels="listLabels"
        :locale="locale"
        @update:selected-index="handleSelectFile"
        @update:checked="handleCheckedChange"
        @play="handlePlayFile"
        @remove="handleRemoveFile"
        @move="handleMoveFile"
      >
        <template #toolbar>
          <UiSegmentedControl
            :model-value="sortOption"
            :options="sortOptions"
            :label="t('label_sort')"
            size="sm"
            @update:model-value="handleSortClick"
          />
          <UiButton variant="ghost" size="sm" @click="handleClear">
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </template>
            {{ t('button_clear_title') }}
          </UiButton>
        </template>
      </UiFileList>

      <UiTextField
        id="playlistName"
        :model-value="playlistName"
        :label="t('label_name')"
        :placeholder="t('placeholder_name')"
        autocomplete="off"
        @update:model-value="handleNameChange"
      />
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import UndoRedoControls from './UndoRedoControls.vue'
  import { UiButton, UiFileList, UiPanel, UiSegmentedControl, UiTextField } from './ui'
  import type { FileListItem, FileListLabels, SegmentedOption } from './ui'
  import { useDurations } from '../composables/useDurations'
  import { usePlaylist, type SortOption } from '../composables/usePlaylist'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Linkes Panel der App-Seite: Dateien hinzufügen (Dialog, Ordner, Drag & Drop),
   * Liste verwalten, Reihenfolge und Name festlegen. Die Schnittstelle zur
   * AppPage ist unverändert; intern laufen Liste und Controls über src/components/ui.
   */
  const props = withDefaults(
    defineProps<{
      files?: File[]
      sortOption?: SortOption
      playlistName?: string
      replaceMode?: boolean
      selectedFileIndex?: number
      playingIndex?: number
      isPlaying?: boolean
    }>(),
    {
      files: () => [],
      sortOption: 'manual',
      playlistName: '',
      replaceMode: false,
      selectedFileIndex: -1,
      playingIndex: -1,
      isPlaying: false,
    },
  )

  const emit = defineEmits<{
    'update:sortOption': [value: SortOption]
    'update:playlistName': [value: string]
    'update:replaceMode': [value: boolean]
    'update:selectedFileIndex': [value: number]
    addFiles: [files: File[] | FileList]
    clearFiles: []
    removeFile: [index: number]
    moveFile: [from: number, to: number]
    playFile: [index: number]
  }>()

  const { t, currentLanguage } = useTranslation()
  const { known: knownDurations, measureDurations } = useDurations()
  const { isFileSelected, toggleFileSelected, setAllSelected } = usePlaylist()

  const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|wma|opus)$/i

  // --- Liste -------------------------------------------------------------------

  // Stabile ids je File-Objekt; Dateinamen können sich wiederholen.
  const fileIds = new WeakMap<File, string>()
  let nextFileId = 0
  const idFor = (file: File): string => {
    let id = fileIds.get(file)
    if (id === undefined) {
      id = `file-${++nextFileId}`
      fileIds.set(file, id)
    }
    return id
  }

  const listItems = computed<FileListItem[]>(() =>
    props.files.map((file) => ({
      id: idFor(file),
      name: file.name,
      size: file.size,
      duration: knownDurations.get(file.name) ?? null,
    })),
  )

  const checkedIds = computed(() => props.files.filter(isFileSelected).map(idFor))

  const locale = computed(() => (currentLanguage.value === 'de' ? 'de-DE' : 'en-US'))

  const listLabels = computed<Partial<FileListLabels>>(() => ({
    list: t.value('file_list_label'),
    selectAll: t.value('select_all'),
    include: t.value('file_list_include'),
    dragHandle: t.value('file_list_drag_handle'),
    play: t.value('player_play'),
    pause: t.value('player_pause'),
    remove: t.value('file_list_remove'),
    tracks: t.value('stats_tracks'),
    approximate: t.value('duration_approx_title'),
    emptyTitle: t.value('file_list_empty_title'),
    emptyText: t.value('file_list_empty_text'),
  }))

  const sortOptions = computed<SegmentedOption[]>(() => [
    { value: 'alphabetical', label: t.value('sort_alpha') },
    { value: 'date', label: t.value('sort_date') },
    { value: 'random', label: t.value('sort_random') },
    { value: 'manual', label: t.value('sort_manual') },
  ])

  // Echte Dauern aus den Metadaten lesen, sobald sich die Liste ändert.
  watch(
    () => props.files.slice(),
    (files) => {
      void measureDurations(files)
    },
    { immediate: true },
  )

  function handleCheckedChange(ids: string[]) {
    if (ids.length === 0) {
      setAllSelected(false)
      return
    }
    if (ids.length === props.files.length) {
      setAllSelected(true)
      return
    }
    const wanted = new Set(ids)
    props.files.forEach((file, index) => {
      if (wanted.has(idFor(file)) !== isFileSelected(file)) toggleFileSelected(index)
    })
  }

  const handleSelectFile = (index: number) => emit('update:selectedFileIndex', index)
  const handlePlayFile = (index: number) => emit('playFile', index)
  const handleRemoveFile = (index: number) => emit('removeFile', index)
  const handleMoveFile = (from: number, to: number) => emit('moveFile', from, to)

  // Die AppPage wendet die Option an und sortiert in einem (rückgängig machbaren) Schritt.
  const handleSortClick = (value: string) => emit('update:sortOption', value as SortOption)
  const handleNameChange = (value: string) => emit('update:playlistName', value)
  const handleReplaceModeChange = (event: Event) =>
    emit('update:replaceMode', (event.target as HTMLInputElement).checked)

  // --- Dateien hinzufügen --------------------------------------------------------

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const folderInputRef = ref<HTMLInputElement | null>(null)
  const isDragging = ref(false)
  const isScanning = ref(false)
  const scanCount = ref(0)
  let dragCounter = 0

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    emit('addFiles', input.files ?? [])
    input.value = ''
  }

  const handleFolderChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    isScanning.value = true
    scanCount.value = 0
    // Der Browser hat den Ordner über webkitdirectory bereits durchlaufen, filtern ist sofort möglich.
    const audio = Array.from(input.files ?? []).filter((file) => AUDIO_EXTENSIONS.test(file.name))
    scanCount.value = audio.length
    isScanning.value = false
    if (audio.length > 0) emit('addFiles', audio)
    input.value = ''
  }

  const handleDragEnter = () => {
    dragCounter++
    isDragging.value = true
  }

  const handleDragOver = (event: DragEvent) => {
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = () => {
    dragCounter--
    if (dragCounter === 0) isDragging.value = false
  }

  // Liest ein Verzeichnis rekursiv und sammelt Audiodateien; onProgress meldet den Zwischenstand.
  const readDirectoryEntry = (
    directory: FileSystemDirectoryEntry,
    onProgress?: (count: number) => void,
  ): Promise<File[]> =>
    new Promise((resolve) => {
      const reader = directory.createReader()
      const results: File[] = []

      const readBatch = () => {
        reader.readEntries(
          (entries) => {
            if (entries.length === 0) {
              resolve(results)
              return
            }
            const pending = entries.map((entry) => {
              if (entry.isFile) {
                return new Promise<void>((done) => {
                  ;(entry as FileSystemFileEntry).file(
                    (file) => {
                      if (AUDIO_EXTENSIONS.test(file.name)) {
                        results.push(file)
                        onProgress?.(results.length)
                      }
                      done()
                    },
                    () => done(),
                  )
                })
              }
              if (entry.isDirectory) {
                return readDirectoryEntry(entry as FileSystemDirectoryEntry, onProgress).then(
                  (files) => {
                    results.push(...files)
                  },
                )
              }
              return Promise.resolve()
            })
            void Promise.all(pending).then(readBatch)
          },
          () => resolve(results),
        )
      }

      readBatch()
    })

  const handleDrop = async (event: DragEvent) => {
    dragCounter = 0
    isDragging.value = false

    const items = event.dataTransfer?.items
    if (!items || items.length === 0) return

    const hasDirectory = Array.from(items).some((item) => item.webkitGetAsEntry?.()?.isDirectory)
    if (hasDirectory) {
      isScanning.value = true
      scanCount.value = 0
    }

    const collected: File[] = []

    const pending = Array.from(items).map((item) => {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
      if (!entry) {
        const file = item.getAsFile()
        if (file && AUDIO_EXTENSIONS.test(file.name)) collected.push(file)
        return Promise.resolve()
      }

      if (entry.isFile) {
        return new Promise<void>((done) => {
          ;(entry as FileSystemFileEntry).file(
            (file) => {
              if (AUDIO_EXTENSIONS.test(file.name)) collected.push(file)
              done()
            },
            () => done(),
          )
        })
      }

      if (entry.isDirectory) {
        return readDirectoryEntry(entry as FileSystemDirectoryEntry, (count) => {
          scanCount.value = count
        }).then((files) => {
          collected.push(...files)
        })
      }

      return Promise.resolve()
    })

    await Promise.all(pending)
    isScanning.value = false
    scanCount.value = 0

    if (collected.length > 0) emit('addFiles', collected)
  }

  const handleClear = () => {
    if (fileInputRef.value) fileInputRef.value.value = ''
    if (folderInputRef.value) folderInputRef.value.value = ''
    emit('clearFiles')
  }

  // Für den Kurzbefehl Strg+O aus der AppPage
  const openFileDialog = () => {
    fileInputRef.value?.click()
  }

  defineExpose({ openFileDialog })
</script>

<style scoped>
  .playlist-config__body {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-4);
  }

  .playlist-config__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .playlist-config__dropzone {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-space-3);
    flex-wrap: wrap;
    min-height: var(--ds-control-lg);
    padding: var(--ds-space-3) var(--ds-space-4);
    border: var(--ds-border-width) solid transparent;
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-2);
    color: var(--ds-text-2);
    text-align: center;
    transition:
      border-color var(--ds-duration) var(--ds-ease),
      background-color var(--ds-duration) var(--ds-ease);
  }

  .playlist-config__dropzone--over {
    border-color: var(--ds-accent);
    background: var(--ds-accent-soft);
    color: var(--ds-text);
  }

  .playlist-config__dropzone--scanning {
    border-color: var(--ds-accent);
    cursor: wait;
  }

  .playlist-config__dropzone-icon {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    color: var(--ds-text-3);
    flex-shrink: 0;
  }

  .playlist-config__dropzone--over .playlist-config__dropzone-icon {
    color: var(--ds-accent);
  }

  .playlist-config__dropzone-title {
    font-size: var(--ds-text-md);
    font-weight: var(--ds-weight-medium);
  }

  .playlist-config__dropzone-hint {
    font-size: var(--ds-text-sm);
    color: var(--ds-text-3);
  }

  .playlist-config__scan-count {
    margin-left: var(--ds-space-1);
    color: var(--ds-accent);
    font-weight: var(--ds-weight-semibold);
    font-variant-numeric: tabular-nums;
  }

  .playlist-config__spinner {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    border: 2px solid var(--ds-border-strong);
    border-top-color: var(--ds-accent);
    border-radius: var(--ds-radius-full);
    animation: playlist-config-spin 0.75s linear infinite;
  }

  @keyframes playlist-config-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .playlist-config__replace {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    align-self: flex-start;
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
    cursor: pointer;
  }

  .playlist-config__checkbox {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--ds-accent);
    cursor: pointer;
  }

  .playlist-config__checkbox:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }
</style>
