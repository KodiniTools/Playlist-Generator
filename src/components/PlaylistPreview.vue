<template>
  <UiPanel class="playlist-preview" :title="t('preview_title')">
    <template #actions>
      <UiSelect
        id="outputFormat"
        :model-value="localFormat"
        :options="formats"
        :label="t('label_format')"
        inline
        @update:model-value="setFormat"
      />
    </template>

    <div class="playlist-preview__body">
      <p class="playlist-preview__format-desc" aria-live="polite">
        {{ t(`format_desc_${localFormat}`) }}
      </p>

      <UiCallout v-if="showPathNotice" type="info">{{ t('notice_m3u') }}</UiCallout>

      <div class="playlist-preview__code">
        <div class="playlist-preview__code-header">
          <span class="playlist-preview__file-name">{{ fileName }}</span>
          <span v-if="hasContent" class="playlist-preview__line-count">
            {{ lineCount }} {{ t('lines') }}
          </span>
        </div>

        <ol v-if="hasContent" class="playlist-preview__lines">
          <li v-for="(line, index) in lines" :key="index" class="playlist-preview__line">
            <span class="playlist-preview__line-number" aria-hidden="true">{{ index + 1 }}</span>
            <span
              :class="[
                'playlist-preview__line-text',
                { 'playlist-preview__line-text--directive': isDirective(line) },
              ]"
              >{{ line }}</span
            >
          </li>
        </ol>
        <UiEmptyState
          v-else
          class="playlist-preview__empty"
          :title="t('preview_empty_title')"
          :text="t('placeholder_output')"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </template>
        </UiEmptyState>
      </div>

      <div class="playlist-preview__actions">
        <UiButton
          variant="secondary"
          :disabled="!hasContent"
          :title="t('shortcut_copy')"
          @click="handleCopy"
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </template>
          {{ t('button_copy') }}
        </UiButton>
        <UiButton variant="primary" :title="t('shortcut_save')" @click="handleSave">
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
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </template>
          {{ t('button_save') }}
        </UiButton>
      </div>
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { UiButton, UiCallout, UiEmptyState, UiPanel, UiSelect } from './ui'
  import type { SelectOption } from './ui'
  import type { OutputFormat } from '../composables/usePlaylist'
  import { useToast } from '../composables/useToast'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Rechtes Panel der App-Seite: Format wählen, Vorschau mit Zeilennummern,
   * Kopieren und Speichern. Die Schnittstelle zur AppPage ist unverändert;
   * `playlistName` ist optional und bestimmt nur den angezeigten Dateinamen.
   */
  const props = withDefaults(
    defineProps<{
      outputFormat?: OutputFormat
      playlistContent?: string
      playlistName?: string
    }>(),
    { outputFormat: 'm3u', playlistContent: '', playlistName: '' },
  )

  const emit = defineEmits<{
    'update:outputFormat': [format: OutputFormat]
    save: []
  }>()

  const { t } = useTranslation()
  const toast = useToast()

  const formats: SelectOption[] = [
    { value: 'm3u', label: 'M3U' },
    { value: 'm3u8', label: 'M3U8' },
    { value: 'pls', label: 'PLS' },
    { value: 'txt', label: 'TXT' },
    { value: 'cue', label: 'CUE' },
    { value: 'csv', label: 'CSV' },
    { value: 'xspf', label: 'XSPF' },
    { value: 'json', label: 'JSON' },
  ]

  // Formate ohne Pfadbezug brauchen den Hinweis "im selben Ordner speichern" nicht.
  const formatsWithoutPaths: OutputFormat[] = ['json', 'csv']

  const localFormat = ref<OutputFormat>(props.outputFormat)

  watch(
    () => props.outputFormat,
    (value) => {
      localFormat.value = value
    },
  )

  const setFormat = (format: string) => {
    localFormat.value = format as OutputFormat
    emit('update:outputFormat', format as OutputFormat)
  }

  const hasContent = computed(() => props.playlistContent.length > 0)
  const lines = computed(() => (hasContent.value ? props.playlistContent.split('\n') : []))
  const lineCount = computed(() => lines.value.length)
  const showPathNotice = computed(() => !formatsWithoutPaths.includes(localFormat.value))
  const fileName = computed(() => `${props.playlistName.trim() || 'playlist'}.${localFormat.value}`)

  const isDirective = (line: string) => line.startsWith('#')

  const handleCopy = async () => {
    if (!hasContent.value) {
      toast.error(t.value('alert_create_first'))
      return
    }
    try {
      await navigator.clipboard.writeText(props.playlistContent)
      toast.success(t.value('toast_copied'))
    } catch {
      toast.error(t.value('toast_copy_error'))
    }
  }

  const handleSave = () => {
    emit('save')
  }
</script>

<style scoped>
  /* Bleibt beim Scrollen sichtbar, solange die App-Seite zweispaltig ist. */
  .playlist-preview {
    position: sticky;
    top: var(--ds-space-5);
  }

  @media (max-width: 768px) {
    .playlist-preview {
      position: static;
    }
  }

  .playlist-preview__body {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-3);
  }

  .playlist-preview__format-desc {
    margin: 0;
    font-size: var(--ds-text-sm);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .playlist-preview__code {
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-0);
    overflow: hidden;
  }

  .playlist-preview__code-header {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-2) var(--ds-space-3);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }

  .playlist-preview__file-name {
    flex: 1;
    min-width: 0;
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-xs);
    color: var(--ds-text-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .playlist-preview__line-count {
    font-size: var(--ds-text-xs);
    color: var(--ds-text-3);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .playlist-preview__lines {
    list-style: none;
    margin: 0;
    padding: var(--ds-space-3) var(--ds-space-3);
    min-height: 200px;
    max-height: 340px;
    overflow: auto;
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-sm);
    line-height: 1.6;
    scrollbar-width: thin;
  }

  .playlist-preview__line {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    column-gap: var(--ds-space-3);
  }

  .playlist-preview__line-number {
    text-align: right;
    color: var(--ds-text-3);
    user-select: none;
  }

  .playlist-preview__line-text {
    color: var(--ds-text);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .playlist-preview__line-text--directive {
    color: var(--ds-text-2);
  }

  .playlist-preview__empty {
    min-height: 200px;
    justify-content: center;
  }

  .playlist-preview__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--ds-space-2);
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    .playlist-preview__actions > * {
      flex: 1 1 100%;
    }
  }
</style>
