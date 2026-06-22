<template>
  <section class="output-section">
    <h2 class="section-title">{{ t('preview_title') }}</h2>

    <div class="form-group">
      <label>{{ t('label_format') }}</label>
      <div class="format-tabs" role="group" :aria-label="t('label_format')">
        <button
          v-for="fmt in formats"
          :key="fmt.value"
          type="button"
          class="format-tab"
          :class="{ active: localFormat === fmt.value }"
          @click="setFormat(fmt.value)"
        >{{ fmt.label }}</button>
      </div>
      <Transition name="desc">
        <p class="format-desc" :key="localFormat" aria-live="polite">
          {{ t('format_desc_' + localFormat) }}
        </p>
      </Transition>
    </div>

    <div class="code-viewer" :class="{ empty: !playlistContent }">
      <div class="code-viewer-header">
        <span class="code-lang-badge">{{ localFormat.toUpperCase() }}</span>
        <span v-if="playlistContent" class="code-stats">{{ lineCount }} {{ t('lines') || 'Zeilen' }}</span>
      </div>
      <div class="code-viewer-body">
        <pre v-if="playlistContent" class="code-content"><code>{{ playlistContent }}</code></pre>
        <div v-else class="code-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>{{ t('placeholder_output') }}</span>
        </div>
      </div>
    </div>

    <div class="button-row">
      <button
        type="button"
        class="copy-button"
        @click="handleCopy"
        :disabled="!playlistContent"
        :title="t('shortcut_copy')"
      >
        <span class="button-icon">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              ry="2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ></path>
          </svg>
        </span>
        {{ t('button_copy') }}
      </button>
      <button type="button" class="save-button" @click="handleSave" :title="t('shortcut_save')">
        <span class="button-icon">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ></path>
            <polyline
              points="17 21 17 13 7 13 7 21"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ></polyline>
            <polyline
              points="7 3 7 8 15 8"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ></polyline>
          </svg>
        </span>
        {{ t('button_save') }}
      </button>
    </div>

    <AudioPlayer :files="files" />
  </section>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useTranslation } from '../composables/useTranslation'
  import { useToast } from '../composables/useToast'
  import AudioPlayer from './AudioPlayer.vue'

  const props = defineProps({
    outputFormat: String,
    playlistContent: String,
    files: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['update:outputFormat', 'save'])

  const { t } = useTranslation()
  const toast = useToast()
  const localFormat = ref(props.outputFormat)

  const formats = [
    { value: 'm3u', label: 'M3U' },
    { value: 'xspf', label: 'XSPF' },
    { value: 'json', label: 'JSON' },
  ]

  watch(
    () => props.outputFormat,
    (newVal) => {
      localFormat.value = newVal
    },
  )

  const setFormat = (format) => {
    localFormat.value = format
    emit('update:outputFormat', format)
  }

  const lineCount = computed(() =>
    props.playlistContent ? props.playlistContent.split('\n').length : 0,
  )

  const handleCopy = async () => {
    if (!props.playlistContent) {
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
  /* Format Tabs (Segmented Control) */
  .format-tabs {
    display: flex;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 3px;
    width: fit-content;
    gap: 2px;
  }

  .format-tab {
    padding: 6px 20px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--muted-color);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.04em;
    font-family: inherit;
  }

  .format-tab:hover {
    color: var(--text-color);
  }

  .format-tab.active {
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
    box-shadow: 0 2px 8px var(--shadow-color);
  }

  .form-group {
    position: relative;
  }

  /* Format description */
  .format-desc {
    margin: 8px 0 0;
    font-size: 0.8rem;
    color: var(--muted-color);
    opacity: 0.8;
    line-height: 1.5;
  }

  .desc-enter-active,
  .desc-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .desc-enter-from {
    opacity: 0;
    transform: translateY(-4px);
  }
  .desc-leave-to {
    opacity: 0;
    transform: translateY(4px);
  }
  .desc-leave-active {
    position: absolute;
  }

  /* Code Viewer */
  .code-viewer {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    background: var(--input-bg);
    transition: border-color 0.2s ease;
    margin-top: 4px;
  }

  .code-viewer:not(.empty):hover {
    border-color: var(--accent-color);
  }

  .code-viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 14px;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid var(--border-color);
  }

  .light-theme .code-viewer-header {
    background: rgba(0, 0, 0, 0.04);
  }

  .code-lang-badge {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--accent-color);
    font-family: 'Courier New', monospace;
  }

  .code-stats {
    font-size: 0.7rem;
    color: var(--muted-color);
    font-family: 'Courier New', monospace;
    opacity: 0.7;
  }

  .code-viewer-body {
    min-height: 200px;
    max-height: 340px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;
  }

  .code-viewer-body::-webkit-scrollbar {
    width: 5px;
  }

  .code-viewer-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .code-viewer-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .code-content {
    margin: 0;
    padding: 14px 16px;
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--text-color);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .code-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 200px;
    color: var(--muted-color);
    opacity: 0.45;
    font-size: 0.88rem;
    text-align: center;
    padding: 20px;
  }

  /* Button Row */
  .button-row {
    display: flex;
    gap: 12px;
    margin-top: 15px;
  }

  .copy-button,
  .save-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
  }

  .copy-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-icon {
    display: flex;
    align-items: center;
  }

  @media (max-width: 480px) {
    .button-row {
      flex-direction: column;
      gap: 8px;
    }
  }
</style>
