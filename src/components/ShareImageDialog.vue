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

      <div class="share-image__colors">
        <label class="share-image__color">
          <input v-model="textColor" type="color" class="share-image__swatch" data-color="text" />
          <span>{{ t('share_image_text_color') }}</span>
        </label>
        <label class="share-image__color">
          <input
            v-model="backgroundColor"
            type="color"
            class="share-image__swatch"
            data-color="background"
          />
          <span>{{ t('share_image_background_color') }}</span>
        </label>
        <UiButton
          size="sm"
          variant="ghost"
          :disabled="!customized"
          data-action="reset-colors"
          @click="resetColors"
        >
          {{ t('share_image_reset_colors') }}
        </UiButton>
      </div>
      <UiCallout v-if="lowContrast" type="warning">{{ t('share_image_low_contrast') }}</UiCallout>

      <div class="share-image__photo">
        <input
          ref="photoInput"
          type="file"
          class="share-image__file"
          accept="image/png,image/jpeg,image/webp"
          tabindex="-1"
          data-input="background-image"
          @change="handlePhotoChange"
        />
        <UiButton size="sm" data-action="pick-background" @click="photoInput?.click()">
          {{ photo ? t('share_image_photo_replace') : t('share_image_photo_pick') }}
        </UiButton>
        <template v-if="photo">
          <span class="share-image__photo-name" :title="photoName">{{ photoName }}</span>
          <label class="share-image__opacity">
            <span>{{ t('share_image_photo_opacity') }}</span>
            <input
              v-model.number="photoOpacity"
              type="range"
              min="0"
              max="100"
              step="5"
              data-input="background-opacity"
            />
            <output>{{ photoOpacity }} %</output>
          </label>
          <UiButton
            size="sm"
            variant="ghost"
            data-action="remove-background"
            @click="setPhoto(null)"
          >
            {{ t('share_image_photo_remove') }}
          </UiButton>
        </template>
        <span v-else class="share-image__hint">{{ t('share_image_photo_hint') }}</span>
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
  import { UiButton, UiCallout, UiDialog, UiSegmentedControl } from './ui'
  import type { SegmentedOption } from './ui'
  import { usePlaylist } from '../composables/usePlaylist'
  import { useDurations } from '../composables/useDurations'
  import { useTrackTags } from '../composables/useTrackTags'
  import { useToast } from '../composables/useToast'
  import { useTranslation, type TranslationKey } from '../composables/useTranslation'
  import type { ThemeName } from '../design-system/tokens'
  import {
    BackgroundImageError,
    SHARE_IMAGE_SIZES,
    contrastRatio,
    defaultShareColors,
    formatTotal,
    loadBackgroundImage,
    renderShareImage,
    shareImageFileName,
    summarizeTracks,
    type BackgroundErrorCode,
    type ShareBackground,
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

  // Eigene Farben; beim Wechsel des Farbschemas starten sie wieder bei dessen Werten.
  const textColor = ref(defaultShareColors('dark').text)
  const backgroundColor = ref(defaultShareColors('dark').background)
  const colors = computed(() => ({ text: textColor.value, background: backgroundColor.value }))
  const customized = computed(() => {
    const preset = defaultShareColors(theme.value)
    return (
      textColor.value.toLowerCase() !== preset.text.toLowerCase() ||
      backgroundColor.value.toLowerCase() !== preset.background.toLowerCase()
    )
  })
  // Unter 4,5:1 (WCAG AA) ist der Text auf dem Handy schwer lesbar.
  // Mit Foto entscheidet das Bild über den Kontrast, die Farbprüfung sagt dann nichts aus.
  const lowContrast = computed(
    () => !photo.value && contrastRatio(textColor.value, backgroundColor.value) < 4.5,
  )

  function resetColors() {
    const preset = defaultShareColors(theme.value)
    textColor.value = preset.text
    backgroundColor.value = preset.background
  }

  // sync: die Farben stehen schon fest, bevor das Bild neu gezeichnet wird.
  watch(theme, resetColors, { immediate: true, flush: 'sync' })

  // Eigenes Hintergrundbild, liegt mit `photoOpacity` über der Hintergrundfarbe.
  const photoInput = ref<HTMLInputElement | null>(null)
  const photo = shallowRef<ImageBitmap | null>(null)
  const photoName = ref('')
  const photoOpacity = ref(60)
  const background = computed<ShareBackground | null>(() =>
    photo.value ? { image: photo.value, opacity: photoOpacity.value / 100 } : null,
  )

  function setPhoto(next: ImageBitmap | null, name = '') {
    photo.value?.close()
    photo.value = next
    photoName.value = name
  }

  const PHOTO_ERRORS: Record<BackgroundErrorCode, TranslationKey> = {
    type: 'toast_share_photo_type',
    size: 'toast_share_photo_size',
    decode: 'toast_share_photo_decode',
  }

  async function handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    try {
      setPhoto(await loadBackgroundImage(file), file.name)
    } catch (err) {
      const code = err instanceof BackgroundImageError ? err.code : 'decode'
      console.warn('Could not load background image:', err)
      toast.error(t.value(PHOTO_ERRORS[code]))
    }
  }

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
      const result = await renderShareImage(
        data.value,
        format.value,
        theme.value,
        type.value,
        colors.value,
        background.value,
      )
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
      if (open) {
        theme.value = document.body.classList.contains('light-theme') ? 'light' : 'dark'
      } else setPreview(null)
    },
    { immediate: true },
  )

  watch(
    [() => props.open, data, format, theme, type, colors, background],
    () => {
      if (props.open) void render()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    setPreview(null)
    setPhoto(null)
  })

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

  .share-image__colors {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ds-space-2) var(--ds-space-4);
  }

  .share-image__color {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    color: var(--ds-text-2);
    font-size: var(--ds-text-sm);
    cursor: pointer;
  }

  .share-image__swatch {
    width: 2.25rem;
    height: 2.25rem;
    padding: 2px;
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius-sm);
    background: var(--ds-surface-1);
    cursor: pointer;
  }

  .share-image__photo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ds-space-2) var(--ds-space-3);
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
  }

  .share-image__file {
    display: none;
  }

  .share-image__photo-name {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .share-image__opacity {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
  }

  .share-image__opacity input {
    width: 8rem;
    accent-color: var(--ds-accent);
  }

  .share-image__opacity output {
    min-width: 3.5em;
    font-variant-numeric: tabular-nums;
  }

  .share-image__hint {
    color: var(--ds-text-3);
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
