<template>
  <div :class="['app-page', { 'app-page--has-player': files.length > 0 }]">
    <AppHeader>
      <template #actions>
        <KeyboardShortcutsPanel />
      </template>
    </AppHeader>

    <main class="app-page__main">
      <header class="app-page__intro">
        <h1 class="app-page__title">{{ t('main_title') }}</h1>
        <p class="app-page__subtitle">{{ t('subtitle') }}</p>
      </header>

      <UiCallout v-if="sharedBanner" :type="calloutType(sharedBanner.type)">
        {{ sharedBanner.message }}
      </UiCallout>

      <OnboardingBanner :has-files="files.length > 0" />

      <div class="app-page__workspace">
        <PlaylistConfig
          ref="playlistConfigRef"
          :files="files"
          :sort-option="sortOption"
          :playlist-name="playlistName"
          :replace-mode="replaceMode"
          :selected-file-index="selectedFileIndex"
          :playing-index="playingIndex"
          :is-playing="isPlaying"
          @update:sort-option="applySortOption"
          @update:playlist-name="setPlaylistName"
          @update:replace-mode="setReplaceMode"
          @update:selected-file-index="selectedFileIndex = $event"
          @add-files="handleAddFiles"
          @clear-files="handleClearFiles"
          @remove-file="handleDeleteFile"
          @move-file="moveFile"
          @play-file="handlePlayFile"
        />

        <PlaylistPreview
          :output-format="outputFormat"
          :playlist-content="playlistContent"
          :playlist-name="playlistName"
          :path-mode="pathMode"
          :base-path="basePath"
          @update:output-format="handleFormatChange"
          @update:path-mode="setPathMode"
          @update:base-path="setBasePath"
          @save="handleSave"
          @copied="offerTextEditor('copied')"
        />
      </div>

      <ToolsGrid />

      <AppFooter />
    </main>

    <AudioPlayer
      ref="audioPlayerRef"
      :files="files"
      :selected-index="selectedFileIndex"
      @update:selected-index="selectedFileIndex = $event"
    />

    <TextEditorHandoffDialog
      :open="handoffOffer !== null"
      :description="handoffDescription"
      @accept="acceptHandoff"
      @decline="declineHandoff"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import AppHeader from '../components/AppHeader.vue'
  import AudioPlayer from '../components/AudioPlayer.vue'
  import KeyboardShortcutsPanel from '../components/KeyboardShortcutsPanel.vue'
  import OnboardingBanner from '../components/OnboardingBanner.vue'
  import PlaylistConfig from '../components/PlaylistConfig.vue'
  import PlaylistPreview from '../components/PlaylistPreview.vue'
  import ToolsGrid from '../components/ToolsGrid.vue'
  import AppFooter from '../components/app/AppFooter.vue'
  import TextEditorHandoffDialog from '../components/app/TextEditorHandoffDialog.vue'
  import { UiCallout } from '../components/ui'
  import { useAppShortcuts } from '../composables/useAppShortcuts'
  import { isImportableFileName, useFileImport } from '../composables/useFileImport'
  import { usePlaylist, type OutputFormat } from '../composables/usePlaylist'
  import { calloutType, useSharedFilesImport } from '../composables/useSharedFilesImport'
  import { useTextEditorHandoff } from '../composables/useTextEditorHandoff'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'
  import { useUndoToast } from '../composables/useUndoToast'
  import { consumeLaunchedFiles } from '../utils/pwa'

  /**
   * App-Seite: verdrahtet Dateien-Panel, Vorschau, Player und Dialoge mit
   * usePlaylist. Die Abläufe liegen in Composables (Datei-Import, geteilte
   * Dateien, Texteditor-Übergabe, Undo-Toast, Kurzbefehle), Fußzeile und
   * Übergabe-Dialog in components/app/.
   */
  const { t } = useTranslation()
  const toast = useToast()
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
    clearFiles,
    removeFile,
    moveFile,
    applySortOption,
    setPlaylistName,
    setOutputFormat,
    setReplaceMode,
    setPathMode,
    setBasePath,
    savePlaylist,
  } = usePlaylist()

  const { sharedBanner } = useSharedFilesImport()
  const { handleAddFiles } = useFileImport()
  const { handoffOffer, handoffDescription, offerTextEditor, declineHandoff, acceptHandoff } =
    useTextEditorHandoff()
  const { showUndoToast, undo, redo } = useUndoToast()

  // --- Kind-Komponenten -----------------------------------------------------------

  const playlistConfigRef = ref<InstanceType<typeof PlaylistConfig> | null>(null)
  const audioPlayerRef = ref<InstanceType<typeof AudioPlayer> | null>(null)

  // Wiedergabezustand des Players für die Markierung in der Dateiliste.
  const playingIndex = computed(() => audioPlayerRef.value?.currentTrackIndex ?? -1)
  const isPlaying = computed(() => audioPlayerRef.value?.isPlaying ?? false)

  // Titel in der Liste angeklickt: markieren und sofort abspielen.
  const handlePlayFile = (index: number) => {
    if (index < 0 || index >= files.value.length) return
    selectedFileIndex.value = index
    audioPlayerRef.value?.playTrack(index)
  }

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format)
  }

  // --- Speichern und Kopieren -------------------------------------------------------

  const handleSave = async () => {
    if (!playlistContent.value) {
      toast.error(t.value('alert_create_first'))
      return
    }

    // true = gespeichert, false = Fehler, null = vom Nutzer abgebrochen
    const result = await savePlaylist()
    if (result === false) {
      toast.error(t.value('alert_save_error'))
    } else if (result === true) {
      toast.success(t.value('toast_playlist_saved'))
      offerTextEditor('saved')
    }
  }

  const handleCopy = async () => {
    if (!playlistContent.value) {
      toast.error(t.value('alert_create_first'))
      return
    }

    try {
      await navigator.clipboard.writeText(playlistContent.value)
      toast.success(t.value('toast_copied'))
      offerTextEditor('copied')
    } catch {
      toast.error(t.value('toast_copy_error'))
    }
  }

  // --- Entfernen mit Rückgängig-Toast ---------------------------------------------

  const handleDeleteFile = (index: number) => {
    if (index < 0 || index >= files.value.length) return
    removeFile(index)
    if (selectedFileIndex.value >= files.value.length) {
      selectedFileIndex.value = files.value.length - 1
    }
    showUndoToast('toast_file_removed')
  }

  const handleClearFiles = () => {
    if (files.value.length === 0) return
    clearFiles()
    selectedFileIndex.value = -1
    showUndoToast('toast_files_cleared')
  }

  // --- Kurzbefehle, Einfügen und „Öffnen mit“ ---------------------------------------

  useAppShortcuts({
    openFiles: () => playlistConfigRef.value?.openFileDialog(),
    save: () => void handleSave(),
    copy: () => void handleCopy(),
    deleteSelected: () => handleDeleteFile(selectedFileIndex.value),
    undo,
    redo,
    moveSelection: (delta) => {
      if (files.value.length === 0) return false
      selectedFileIndex.value =
        delta > 0
          ? Math.min(selectedFileIndex.value + 1, files.value.length - 1)
          : Math.max(selectedFileIndex.value - 1, 0)
      return true
    },
    clearSelection: () => {
      selectedFileIndex.value = -1
    },
  })

  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.files
    if (!items || items.length === 0) return
    const usable = Array.from(items).filter((file) => isImportableFileName(file.name))
    if (usable.length > 0) {
      event.preventDefault()
      void handleAddFiles(usable)
    }
  }

  onMounted(() => {
    window.addEventListener('paste', handlePaste)
    // Installierte App: per „Öffnen mit“ übergebene Audio- und Playlist-Dateien
    consumeLaunchedFiles(handleAddFiles)
  })

  onUnmounted(() => {
    window.removeEventListener('paste', handlePaste)
  })
</script>

<style scoped>
  .app-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

  /* Platz für die fixe Player-Leiste, damit der Footer erreichbar bleibt. */
  .app-page--has-player {
    padding-bottom: calc(var(--ds-player-height) + var(--ds-space-4));
  }

  .app-page__main {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-5);
    max-width: var(--ds-container);
    margin: 0 auto;
    padding: var(--ds-space-6) var(--ds-gutter) var(--ds-space-8);
    box-sizing: border-box;
  }

  .app-page__intro {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-1);
  }

  .app-page__title {
    margin: 0;
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
  }

  .app-page__subtitle {
    margin: 0;
    font-size: var(--ds-text-md);
    color: var(--ds-text-2);
  }

  .app-page__workspace {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--ds-gap);
    align-items: start;
  }

  @media (max-width: 768px) {
    .app-page__workspace {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 480px) {
    .app-page__main {
      gap: var(--ds-space-4);
      padding: var(--ds-space-4) var(--ds-space-4) var(--ds-space-6);
    }

    .app-page__title {
      font-size: var(--ds-text-xl);
    }
  }
</style>
