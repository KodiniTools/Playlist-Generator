<template>
  <div
    :class="[
      'playlist-config__dropzone',
      {
        'playlist-config__dropzone--over': isDragging && !isScanning,
        'playlist-config__dropzone--scanning': isScanning,
      },
    ]"
    :aria-busy="isScanning"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
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
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useTranslation } from '../../composables/useTranslation'
  import { collectDroppedFiles, hasDirectoryItem } from '../../utils/dropFiles'

  /**
   * Ablagefläche für Dateien und Ordner. Ordner werden rekursiv gelesen (mit
   * Fortschrittszähler); gemeldet werden nur nicht leere Funde über `files`.
   */
  const emit = defineEmits<{
    files: [files: File[]]
  }>()

  const { t } = useTranslation()
  const isDragging = ref(false)
  const isScanning = ref(false)
  const scanCount = ref(0)
  // dragenter/dragleave feuern auch für Kindelemente; der Zähler verhindert Flackern.
  let dragCounter = 0

  const onDragEnter = () => {
    dragCounter++
    isDragging.value = true
  }

  const onDragOver = (event: DragEvent) => {
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = () => {
    dragCounter--
    if (dragCounter === 0) isDragging.value = false
  }

  const onDrop = async (event: DragEvent) => {
    dragCounter = 0
    isDragging.value = false

    const items = event.dataTransfer?.items
    if (!items || items.length === 0) return

    if (hasDirectoryItem(items)) {
      isScanning.value = true
      scanCount.value = 0
    }

    try {
      const collected = await collectDroppedFiles(items, (count) => {
        scanCount.value = count
      })
      if (collected.length > 0) emit('files', collected)
    } finally {
      isScanning.value = false
      scanCount.value = 0
    }
  }
</script>

<style scoped>
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
</style>
