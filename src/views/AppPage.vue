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
          @update:output-format="handleFormatChange"
          @save="handleSave"
          @copied="offerTextEditor('copied')"
        />
      </div>

      <ToolsGrid />

      <footer class="app-page__footer">
        <form
          action="https://www.paypal.com/donate"
          method="post"
          target="_top"
          class="app-page__donate"
        >
          <input type="hidden" name="hosted_button_id" value="8RGLGQ2BFMHU6" />
          <UiButton type="submit" variant="ghost" size="sm" :title="t('donate_title')">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.62h6.597c2.179 0 3.893.603 5.091 1.791.602.598 1.014 1.291 1.223 2.063.219.796.264 1.724.13 2.758l-.015.1v.46l.358.205c.302.167.543.361.729.583.306.366.508.815.601 1.333.096.532.086 1.166-.028 1.884-.13.828-.355 1.551-.668 2.147a4.467 4.467 0 0 1-1.081 1.393c-.426.37-.932.653-1.504.84-.559.182-1.192.273-1.882.273H14.1a.947.947 0 0 0-.937.803l-.036.21-.604 3.832-.028.168a.947.947 0 0 1-.936.803H7.076Z"
                />
              </svg>
            </template>
            {{ t('donate_button') }}
          </UiButton>
        </form>
        <UiButton
          variant="ghost"
          size="sm"
          :title="t('facebook_share_title')"
          @click="shareOnFacebook"
        >
          <template #icon>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </template>
          {{ t('facebook_share') }}
        </UiButton>
      </footer>
    </main>

    <AudioPlayer
      ref="audioPlayerRef"
      :files="files"
      :selected-index="selectedFileIndex"
      @update:selected-index="selectedFileIndex = $event"
    />

    <UiDialog
      :open="handoffOffer !== null"
      :title="t('handoff_title')"
      :description="handoffDescription"
      :close-label="t('toast_close')"
      @close="declineHandoff"
    >
      <template #footer>
        <UiButton variant="secondary" data-action="handoff-decline" @click="declineHandoff">
          {{ t('handoff_decline') }}
        </UiButton>
        <UiButton variant="primary" data-action="handoff-accept" @click="acceptHandoff">
          {{ t('handoff_accept') }}
        </UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppHeader from '../components/AppHeader.vue'
  import AudioPlayer from '../components/AudioPlayer.vue'
  import KeyboardShortcutsPanel from '../components/KeyboardShortcutsPanel.vue'
  import OnboardingBanner from '../components/OnboardingBanner.vue'
  import PlaylistConfig from '../components/PlaylistConfig.vue'
  import PlaylistPreview from '../components/PlaylistPreview.vue'
  import ToolsGrid from '../components/ToolsGrid.vue'
  import { UiButton, UiCallout, UiDialog } from '../components/ui'
  import type { CalloutType } from '../components/ui'
  import { usePlaylist, type OutputFormat } from '../composables/usePlaylist'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'
  import { useUndoRedo } from '../composables/useUndoRedo'
  import { clearSharedFiles, getSharedFiles } from '../utils/sharedFileRepository'
  import { FORMAT_MIME, openInTextEditor } from '../utils/textEditorHandoff'

  type BannerType = 'success' | 'error' | 'warning' | 'info'

  interface SharedBanner {
    type: BannerType
    message: string
  }

  const { t } = useTranslation()
  const toast = useToast()
  const route = useRoute()
  const router = useRouter()
  const {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    selectedFileIndex,
    addFiles,
    clearFiles,
    removeFile,
    moveFile,
    applySortOption,
    setPlaylistName,
    setOutputFormat,
    setReplaceMode,
    savePlaylist,
    handleSharedFiles,
  } = usePlaylist()
  const { performUndo, performRedo } = useUndoRedo()

  // --- Geteilte Dateien aus anderen KodiniTools ---------------------------------

  const sharedBanner = ref<SharedBanner | null>(null)
  let sharedFilesHandled = false

  const SHARED_SOURCES = ['audiokonverter', 'audionormalizer']

  const calloutType = (type: BannerType): CalloutType => (type === 'error' ? 'danger' : type)

  const querySource = (): string | null => {
    const source = route.query.source
    return typeof source === 'string' ? source : null
  }

  async function loadSharedFiles() {
    if (sharedFilesHandled) return
    sharedFilesHandled = true

    const isNormalizer = querySource() === 'audionormalizer'

    try {
      let records = await getSharedFiles()

      // Leere IndexedDB beim ersten Lesen: einmal nach 1 s erneut versuchen, falls
      // der Absender seinen Schreibvorgang noch nicht abgeschlossen hatte.
      if (isNormalizer && (!records || records.length === 0)) {
        sharedBanner.value = {
          type: 'info',
          message: t.value('sharedFilesNormalizerLoading').replace('{count}', '...'),
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
        records = await getSharedFiles()
      }

      if (!records?.length) {
        sharedBanner.value = {
          type: 'warning',
          message: isNormalizer
            ? t.value('sharedFilesNormalizerEmpty')
            : t.value('sharedFilesEmpty'),
        }
        setTimeout(() => {
          sharedBanner.value = null
        }, 5000)
        return
      }

      sharedBanner.value = {
        type: 'info',
        message: (isNormalizer
          ? t.value('sharedFilesNormalizerLoading')
          : t.value('sharedFilesLoading')
        ).replace('{count}', String(records.length)),
      }

      let loaded = 0

      if (isNormalizer) {
        // Normalizer-Dateien sind bereits gültige WAVs: direkt als File übernehmen.
        const normFiles = records
          .map((record) => {
            const blob =
              record.blob instanceof Blob
                ? record.blob
                : new Blob([record.blob], { type: record.mimeType || 'audio/wav' })
            if (blob.size === 0) return null
            return new File([blob], record.name, {
              type: record.mimeType || blob.type || 'audio/wav',
              lastModified: Date.now(),
            })
          })
          .filter((file): file is File => file !== null)

        loaded = addFiles(normFiles).added
      } else {
        const { processed } = await handleSharedFiles(records)
        loaded = processed
      }

      if (loaded > 0) {
        await clearSharedFiles()
        sharedBanner.value = {
          type: 'success',
          message: (isNormalizer
            ? t.value('sharedFilesNormalizerLoaded')
            : t.value('sharedFilesLoaded')
          ).replace('{count}', String(loaded)),
        }
      } else {
        sharedBanner.value = {
          type: 'warning',
          message: isNormalizer
            ? t.value('sharedFilesNormalizerEmpty')
            : t.value('sharedFilesEmpty'),
        }
      }
    } catch (err) {
      console.error('Error loading shared files:', err)
      sharedBanner.value = { type: 'error', message: t.value('sharedFilesError') }
    }

    setTimeout(() => {
      sharedBanner.value = null
    }, 5000)
  }

  const isSharedSource = (source: string | null) =>
    source !== null && SHARED_SOURCES.includes(source)

  void router.isReady().then(() => {
    if (isSharedSource(querySource())) void loadSharedFiles()
  })

  watch(
    () => route.query.source,
    () => {
      if (isSharedSource(querySource())) void loadSharedFiles()
    },
  )

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

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.origin + window.location.pathname)
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=600,height=400,noopener,noreferrer',
    )
  }

  const handleAddFiles = (fileList: File[] | FileList) => {
    const { added, skipped } = addFiles(fileList)
    if (added > 0) {
      toast.info(t.value('toast_files_added').replace('{count}', String(added)))
    }
    if (skipped > 0) {
      toast.info(t.value('toast_duplicates_skipped').replace('{count}', String(skipped)))
    }
  }

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format)
  }

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

  // --- Übergabe an den Kodini Texteditor ---------------------------------------
  // Nach Kopieren oder Speichern fragt ein Dialog, ob die Datei im Texteditor
  // weiterbearbeitet werden soll. Annehmen legt sie ab und öffnet den Editor.
  type HandoffReason = 'saved' | 'copied'

  const handoffOffer = ref<HandoffReason | null>(null)

  const handoffFileName = computed(
    () => `${playlistName.value.trim() || 'playlist'}.${outputFormat.value}`,
  )

  const handoffDescription = computed(() =>
    t
      .value(handoffOffer.value === 'saved' ? 'handoff_text_saved' : 'handoff_text_copied')
      .replace('{name}', handoffFileName.value),
  )

  const offerTextEditor = (reason: HandoffReason) => {
    if (!playlistContent.value) return
    handoffOffer.value = reason
  }

  const declineHandoff = () => {
    handoffOffer.value = null
  }

  const acceptHandoff = () => {
    const opened = openInTextEditor({
      name: handoffFileName.value,
      content: playlistContent.value,
      mimeType: FORMAT_MIME[outputFormat.value],
    })
    handoffOffer.value = null
    if (!opened) toast.error(t.value('handoff_error'))
  }

  // Toast mit "Rückgängig"-Button nach destruktiven Aktionen; immer nur einer,
  // damit der Button sich stets auf den letzten Schritt bezieht.
  let undoToastId: number | null = null

  const dismissUndoToast = () => {
    if (undoToastId !== null) toast.removeToast(undoToastId)
    undoToastId = null
  }

  const showUndoToast = (messageKey: string) => {
    dismissUndoToast()
    undoToastId = toast.addToast(t.value(messageKey), 'info', 5000, {
      label: t.value('toast_undo_btn'),
      callback: () => {
        undoToastId = null
        performUndo()
      },
    })
  }

  const handleUndo = () => {
    dismissUndoToast()
    performUndo()
  }

  const handleRedo = () => {
    dismissUndoToast()
    performRedo()
  }

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

  const handleDeleteSelected = () => {
    handleDeleteFile(selectedFileIndex.value)
  }

  // Globale Kurzbefehle. Die Dateiliste verarbeitet Pfeile, Entf und Escape
  // selbst, solange sie den Fokus hat, und reicht diese Tasten nicht weiter.
  const handleKeyDown = (event: KeyboardEvent) => {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return
    }

    if (event.ctrlKey && event.key === 'o') {
      event.preventDefault()
      playlistConfigRef.value?.openFileDialog()
    }

    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      void handleSave()
    }

    if (event.ctrlKey && event.key === 'c' && !window.getSelection()?.toString()) {
      event.preventDefault()
      void handleCopy()
    }

    if (event.key === 'Delete') {
      event.preventDefault()
      handleDeleteSelected()
    }

    const key = event.key.toLowerCase()
    if (event.ctrlKey && key === 'z') {
      event.preventDefault()
      if (event.shiftKey) handleRedo()
      else handleUndo()
    } else if (event.ctrlKey && key === 'y') {
      event.preventDefault()
      handleRedo()
    }

    if (event.key === 'ArrowDown' && files.value.length > 0) {
      event.preventDefault()
      selectedFileIndex.value = Math.min(selectedFileIndex.value + 1, files.value.length - 1)
    }

    if (event.key === 'ArrowUp' && files.value.length > 0) {
      event.preventDefault()
      selectedFileIndex.value = Math.max(selectedFileIndex.value - 1, 0)
    }

    if (event.key === 'Escape') {
      selectedFileIndex.value = -1
    }
  }

  const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|wma|opus)$/i

  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.files
    if (!items || items.length === 0) return
    const audioFiles = Array.from(items).filter((file) => AUDIO_EXTENSIONS.test(file.name))
    if (audioFiles.length > 0) {
      event.preventDefault()
      handleAddFiles(audioFiles)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('paste', handlePaste)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
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

  .app-page__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--ds-space-3);
    flex-wrap: wrap;
    padding-top: var(--ds-space-5);
    border-top: var(--ds-border-width) solid var(--ds-border);
  }

  .app-page__donate {
    display: inline-flex;
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
