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
        accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,.wma,.opus,.m3u,.m3u8,.pls,.xspf,.zip"
        tabindex="-1"
        @change="handleFileChange"
      />
      <input
        id="playlistInput"
        ref="playlistInputRef"
        type="file"
        class="playlist-config__input"
        accept=".m3u,.m3u8,.pls,.xspf"
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

      <PlaylistDropzone @files="emit('addFiles', $event)" />

      <UiSwitch
        v-if="files.length > 0"
        class="playlist-config__replace"
        :model-value="replaceMode"
        :label="t('replace_list_option')"
        @update:model-value="emit('update:replaceMode', $event)"
      />

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
          <UiButton
            variant="ghost"
            size="sm"
            :title="t('title_open_playlist')"
            @click="playlistInputRef?.click()"
          >
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </template>
            {{ t('button_open_playlist') }}
          </UiButton>
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

      <PlaylistTargetLength v-if="files.length > 0" />

      <PlaylistNameRow
        :playlist-name="playlistName"
        @update:playlist-name="emit('update:playlistName', $event)"
      />
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import UndoRedoControls from './UndoRedoControls.vue'
  import PlaylistDropzone from './playlist-config/PlaylistDropzone.vue'
  import PlaylistNameRow from './playlist-config/PlaylistNameRow.vue'
  import PlaylistTargetLength from './playlist-config/PlaylistTargetLength.vue'
  import { UiButton, UiFileList, UiPanel, UiSegmentedControl, UiSwitch } from './ui'
  import type { FileListItem, FileListLabels, SegmentedOption } from './ui'
  import { useDurations } from '../composables/useDurations'
  import { usePlaylist, type SortOption } from '../composables/usePlaylist'
  import { useTranslation } from '../composables/useTranslation'
  import { useTrackTags } from '../composables/useTrackTags'
  import type { AudioTags } from '../utils/audioTags'
  import { isAudioFileName } from '../utils/dropFiles'

  /**
   * Linkes Panel der App-Seite: Dateien hinzufügen (Dialog, Ordner, Drag & Drop),
   * Liste verwalten, Reihenfolge und Name festlegen. Die Schnittstelle zur
   * AppPage ist unverändert; Ablagefläche, Ziel-Länge und Namenszeile liegen
   * in components/playlist-config/, Liste und Controls kommen aus src/components/ui.
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
  const { getTags } = useTrackTags()

  /** „Interpret – Titel“ aus den Tags als Zusatz zum Dateinamen. */
  const detailOf = (tags: AudioTags | null) =>
    [tags?.artist, tags?.title].filter(Boolean).join(' – ') || undefined

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
      detail: detailOf(getTags(file)),
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
    { value: 'artist', label: t.value('sort_artist') },
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
  // --- Dateien hinzufügen --------------------------------------------------------

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const folderInputRef = ref<HTMLInputElement | null>(null)
  const playlistInputRef = ref<HTMLInputElement | null>(null)

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    emit('addFiles', input.files ?? [])
    input.value = ''
  }

  // Der Browser hat den Ordner über webkitdirectory bereits durchlaufen, filtern ist sofort möglich.
  const handleFolderChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const audio = Array.from(input.files ?? []).filter((file) => isAudioFileName(file.name))
    if (audio.length > 0) emit('addFiles', audio)
    input.value = ''
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

  .playlist-config__replace {
    align-self: flex-start;
  }
</style>
