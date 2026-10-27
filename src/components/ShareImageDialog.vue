<template>
  <UiDialog
    :open="open"
    :title="t('share_image_title')"
    :description="t('share_image_description')"
    :close-label="t('toast_close')"
    @close="emit('close')"
  >
    <div class="share-image">
      <div class="share-image__controls">
        <UiSegmentedControl
          v-model="format"
          :options="formatOptions"
          :label="t('share_image_format')"
          size="sm"
        />
        <UiSegmentedControl
          v-model="theme"
          :options="themeOptions"
          :label="t('share_image_theme')"
          size="sm"
        />
        <UiSegmentedControl
          v-model="type"
          :options="typeOptions"
          :label="t('share_image_type')"
          size="sm"
        />
      </div>

      <div :class="['share-image__frame', `share-image__frame--${format}`]">
        <img
          v-if="previewUrl"
          class="share-image__preview"
          :src="previewUrl"
          :alt="t('share_image_preview_alt')"
          :width="size.width"
          :height="size.height"
        />
        <span v-else class="share-image__placeholder" role="status">
          {{ t('share_image_rendering') }}
        </span>
      </div>

      <div class="share-image__actions">
        <UiButton v-if="canShareFiles" :disabled="!blob" data-action="share" @click="handleShare">
          {{ t('share_image_share') }}
        </UiButton>
        <UiButton
          variant="primary"
          :disabled="!blob"
          data-action="download"
          @click="handleDownload"
        >
          {{ t('share_image_download') }}
        </UiButton>
      </div>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
  import { UiButton, UiDialog, UiSegmentedControl } from './ui'
  import type { SegmentedOption } from './ui'
  import { usePlaylist } from '../composables/usePlaylist'
  import { useDurations } from '../composables/useDurations'
  import { useTrackTags } from '../composables/useTrackTags'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'
  import type { ThemeName } from '../design-system/tokens'
  import {
    SHARE_IMAGE_SIZES,
    formatTotal,
    renderShareImage,
    shareImageFileName,
    summarizeTracks,
    type ShareImageData,
    type ShareImageFormat,
    type ShareImageType,
  } from '../utils/shareImage'

  /** Wiedergabeliste als Bild (Story 1080×1920 / Post 1080×1080) herunterladen oder teilen. */
  const props = defineProps<{ open: boolean }>()
  const emit = defineEmits<{ close: [] }>()

  const { t } = useTranslation()
  const { files, playlistName, isFileSelected } = usePlaylist()
  const { getDuration, known } = useDurations()
  const { getTags, revision } = useTrackTags()
  const toast = useToast()

  const format = ref<ShareImageFormat>('story')
  const theme = ref<ThemeName>('dark')
  const type = ref<ShareImageType>('image/png')
  const blob = shallowRef<Blob | null>(null)
  const previewUrl = ref('')

  const size = computed(() => SHARE_IMAGE_SIZES[format.value])

  const formatOptions = computed<SegmentedOption[]>(() => [
    { value: 'story', label: t.value('share_image_story') },
    { value: 'post', label: t.value('share_image_post') },
  ])
  const themeOptions = computed<SegmentedOption[]>(() => [
    { value: 'dark', label: t.value('share_image_dark') },
    { value: 'light', label: t.value('share_image_light') },
  ])
  const typeOptions: SegmentedOption[] = [
    { value: 'image/png', label: 'PNG' },
    { value: 'image/jpeg', label: 'JPEG' },
  ]

  const data = computed<ShareImageData>(() => {
    // Neu zeichnen, sobald Tags oder Laufzeiten nachträglich eintreffen.
    void revision.value
    void known.size
    const summary = summarizeTracks(files.value.filter(isFileSelected), getTags, getDuration)
    const duration = `${summary.approximate ? '≈ ' : ''}${formatTotal(summary.totalSeconds)}`
    return {
      name: playlistName.value.trim() || t.value('share_image_kicker'),
      tracks: summary.tracks,
      kicker: t.value('share_image_kicker'),
      meta: t
        .value('share_image_meta')
        .replace('{count}', String(summary.tracks.length))
        .replace('{duration}', duration),
      moreLabel: t.value('share_image_more'),
      footer: t.value('share_image_footer'),
    }
  })

  const canShareFiles = computed(() => {
    if (typeof navigator.canShare !== 'function') return false
    try {
      return navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })
    } catch {
      return false
    }
  })

  const setPreview = (next: Blob | null) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    blob.value = next
    previewUrl.value = next ? URL.createObjectURL(next) : ''
  }

  // Nur das Ergebnis des letzten Auftrags zählt, wenn schnell umgeschaltet wird.
  let job = 0
  async function render() {
    const id = ++job
    try {
      const result = await renderShareImage(data.value, format.value, theme.value, type.value)
      if (id === job && props.open) setPreview(result)
    } catch (err) {
      if (id !== job) return
      console.warn('Could not render share image:', err)
      setPreview(null)
      toast.error(t.value('toast_share_image_error'))
    }
  }

  watch(
    () => props.open,
    (open) => {
      if (open) theme.value = document.body.classList.contains('light-theme') ? 'light' : 'dark'
      else setPreview(null)
    },
    { immediate: true },
  )

  watch(
    [() => props.open, data, format, theme, type],
    () => {
      if (props.open) void render()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => setPreview(null))

  const fileName = () => shareImageFileName(playlistName.value, format.value, type.value)

  function handleDownload() {
    if (!previewUrl.value) return
    const link = document.createElement('a')
    link.href = previewUrl.value
    link.download = fileName()
    link.click()
    toast.success(t.value('toast_share_image_saved'))
  }

  async function handleShare() {
    if (!blob.value) return
    const file = new File([blob.value], fileName(), { type: type.value })
    try {
      await navigator.share({ files: [file], title: data.value.name })
    } catch (err) {
      if ((err as Error | null)?.name === 'AbortError') return
      console.warn('Could not share image:', err)
      toast.error(t.value('toast_share_image_error'))
    }
  }
</script>

<style scoped>
  .share-image {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-4);
  }

  .share-image__controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ds-space-2) var(--ds-space-3);
  }

  .share-image__frame {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    width: 100%;
    max-height: 60vh;
    overflow: hidden;
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-1);
  }

  .share-image__frame--story {
    max-width: calc(60vh * 9 / 16);
    aspect-ratio: 9 / 16;
  }

  .share-image__frame--post {
    max-width: 60vh;
    aspect-ratio: 1;
  }

  .share-image__preview {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .share-image__placeholder {
    color: var(--ds-text-3);
    font-size: var(--ds-text-sm);
  }

  .share-image__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--ds-space-2);
  }
</style>
