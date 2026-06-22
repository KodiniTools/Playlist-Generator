<template>
  <section class="form-section">
    <h2 class="section-title">{{ t('config_title') }}</h2>
    <form id="playlistForm" @submit.prevent>
      <div class="form-group">
        <label>{{ t('label_files') }}</label>

        <!-- Hidden inputs — webkitdirectory must be in HTML at parse time, not set via JS -->
        <input
          type="file"
          id="fileInput"
          class="file-upload-input"
          multiple
          accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,.wma,.opus"
          @change="handleFileChange"
          ref="fileInputRef"
        />
        <input
          type="file"
          id="folderInput"
          class="file-upload-input"
          webkitdirectory
          @change="handleFolderChange"
          ref="folderInputRef"
        />

        <div
          class="file-upload-wrapper"
          :class="{ 'drag-over': isDragging && !isScanning, 'is-scanning': isScanning }"
          :aria-busy="isScanning"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <!-- Scanning state -->
          <template v-if="isScanning">
            <div class="scan-spinner" aria-hidden="true"></div>
            <p class="zone-title">
              {{ t('scanning_folder') }}
              <span v-if="scanCount > 0" class="scan-count">{{ scanCount }}</span>
            </p>
          </template>

          <!-- Idle state -->
          <template v-else>
            <div class="zone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p class="zone-title">{{ t('drop_hint') || 'Dateien / Ordner hier ablegen' }}</p>
            <div class="upload-buttons">
              <button
                type="button"
                class="upload-btn primary"
                :title="t('shortcut_open')"
                @click="fileInputRef?.click()"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {{ t('button_add_files') || 'Dateien' }}
              </button>
              <button type="button" class="upload-btn" @click="folderInputRef?.click()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                {{ t('button_add_folder') || 'Ordner' }}
              </button>
            </div>
          </template>
        </div>
        <div class="checkbox-option" v-if="files.length > 0">
          <label class="checkbox-label">
            <input type="checkbox" :checked="replaceMode" @change="handleReplaceModeChange" />
            <span class="checkbox-text">{{ t('replace_list_option') }}</span>
          </label>
        </div>
      </div>

      <FileListCanvas
        :files="files"
        :selectedIndex="selectedFileIndex"
        @clear="handleClear"
        @removeFile="handleRemoveFile"
        @moveFile="handleMoveFile"
        @selectFile="handleSelectFile"
      />

      <div class="form-group">
        <label>{{ t('label_sort') }}</label>
        <div class="sort-buttons" role="group" :aria-label="t('label_sort')">
          <button
            type="button"
            :class="['sort-btn', { active: sortOption === 'alphabetical' }]"
            @click="handleSortClick('alphabetical')"
            :title="t('sort_alpha')"
          >
            <span>{{ t('sort_alpha') }}</span>
          </button>
          <button
            type="button"
            :class="['sort-btn', { active: sortOption === 'date' }]"
            @click="handleSortClick('date')"
            :title="t('sort_date')"
          >
            <span>{{ t('sort_date') }}</span>
          </button>
          <button
            type="button"
            :class="['sort-btn', { active: sortOption === 'random' }]"
            @click="handleSortClick('random')"
            :title="t('sort_random')"
          >
            <span>{{ t('sort_random') }}</span>
          </button>
          <button
            type="button"
            :class="['sort-btn', { active: sortOption === 'manual' }]"
            @click="handleSortClick('manual')"
            :title="t('sort_manual')"
          >
            <span>{{ t('sort_manual') }}</span>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="playlistName">{{ t('label_name') }}</label>
        <input
          type="text"
          id="playlistName"
          :placeholder="t('placeholder_name')"
          :value="playlistName"
          @input="handleNameChange"
        />
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import FileListCanvas from './FileListCanvas.vue'
  import { useTranslation } from '../composables/useTranslation'

  defineProps({
    files: Array,
    sortOption: String,
    playlistName: String,
    replaceMode: Boolean,
    selectedFileIndex: Number,
  })

  const emit = defineEmits([
    'update:sortOption',
    'update:playlistName',
    'update:replaceMode',
    'update:selectedFileIndex',
    'addFiles',
    'clearFiles',
    'removeFile',
    'moveFile',
    'sortFiles',
  ])

  const handleReplaceModeChange = (e) => {
    emit('update:replaceMode', e.target.checked)
  }

  const { t } = useTranslation()
  const fileInputRef = ref(null)
  const folderInputRef = ref(null)
  const isDragging = ref(false)
  const isScanning = ref(false)
  const scanCount = ref(0)
  let dragCounter = 0

  const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|wma|opus)$/i

  const handleFileChange = (e) => {
    emit('addFiles', e.target.files)
    e.target.value = ''
  }

  const handleFolderChange = (e) => {
    const all = e.target.files
    isScanning.value = true
    scanCount.value = 0
    // browser already traversed the tree via webkitdirectory – filter is instant
    const audio = Array.from(all).filter((f) => AUDIO_EXTENSIONS.test(f.name))
    scanCount.value = audio.length
    isScanning.value = false
    if (audio.length > 0) emit('addFiles', audio)
    e.target.value = ''
  }

  const handleDragEnter = () => {
    dragCounter++
    isDragging.value = true
  }

  const handleDragOver = (e) => {
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = () => {
    dragCounter--
    if (dragCounter === 0) {
      isDragging.value = false
    }
  }

  // Recursively read a FileSystemDirectoryEntry and collect audio files.
  // onProgress is called with the running total each time a file is found.
  const readDirectoryEntry = (dirEntry, onProgress) => {
    return new Promise((resolve) => {
      const reader = dirEntry.createReader()
      const results = []

      const readBatch = () => {
        reader.readEntries(
          (entries) => {
            if (!entries.length) {
              resolve(results)
              return
            }
            const promises = entries.map((entry) => {
              if (entry.isFile) {
                return new Promise((res) => {
                  entry.file(
                    (file) => {
                      if (AUDIO_EXTENSIONS.test(file.name)) {
                        results.push(file)
                        onProgress?.(results.length)
                      }
                      res()
                    },
                    () => res(),
                  )
                })
              } else if (entry.isDirectory) {
                return readDirectoryEntry(entry, onProgress).then((files) =>
                  results.push(...files),
                )
              }
              return Promise.resolve()
            })
            Promise.all(promises).then(readBatch)
          },
          () => resolve(results),
        )
      }

      readBatch()
    })
  }

  const handleDrop = async (e) => {
    dragCounter = 0
    isDragging.value = false

    const items = e.dataTransfer.items
    if (!items || items.length === 0) return

    const hasDirectory = Array.from(items).some((item) => {
      const entry = item.webkitGetAsEntry?.()
      return entry?.isDirectory
    })

    if (hasDirectory) {
      isScanning.value = true
      scanCount.value = 0
    }

    const collectedFiles = []

    const promises = Array.from(items).map((item) => {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
      if (!entry) {
        const file = item.getAsFile()
        if (file && AUDIO_EXTENSIONS.test(file.name)) collectedFiles.push(file)
        return Promise.resolve()
      }

      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file) => {
            if (AUDIO_EXTENSIONS.test(file.name)) collectedFiles.push(file)
            resolve()
          }, resolve)
        })
      }

      if (entry.isDirectory) {
        return readDirectoryEntry(entry, (count) => {
          scanCount.value = count
        }).then((files) => collectedFiles.push(...files))
      }

      return Promise.resolve()
    })

    await Promise.all(promises)
    isScanning.value = false
    scanCount.value = 0

    if (collectedFiles.length > 0) {
      emit('addFiles', collectedFiles)
    }
  }

  const handleClear = () => {
    if (fileInputRef.value) fileInputRef.value.value = ''
    if (folderInputRef.value) folderInputRef.value.value = ''
    emit('clearFiles')
  }

  const handleRemoveFile = (index) => {
    emit('removeFile', index)
  }

  const handleMoveFile = (fromIndex, toIndex) => {
    emit('moveFile', fromIndex, toIndex)
  }

  const handleSortClick = (value) => {
    emit('update:sortOption', value)
    emit('sortFiles')
  }

  const handleNameChange = (e) => {
    emit('update:playlistName', e.target.value)
  }

  const handleSelectFile = (index) => {
    emit('update:selectedFileIndex', index)
  }

  // Expose method for keyboard shortcut (Ctrl+O opens files)
  const openFileDialog = () => {
    fileInputRef.value?.click()
  }

  defineExpose({
    openFileDialog,
  })
</script>

<style scoped>
  .file-upload-input {
    display: none;
  }

  /* Upload Zone */
  .file-upload-wrapper {
    border: 2px dashed var(--border-color);
    border-radius: 14px;
    padding: 28px 20px 20px;
    text-align: center;
    transition:
      border-color 0.25s ease,
      background 0.25s ease;
  }

  /* Scanning state */
  .file-upload-wrapper.is-scanning {
    border-style: solid;
    border-color: var(--accent-color);
    cursor: wait;
  }

  .scan-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--border-color);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-bottom: 10px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .scan-count {
    display: inline-block;
    margin-left: 6px;
    font-variant-numeric: tabular-nums;
    color: var(--accent-color);
    font-weight: 600;
  }

  .file-upload-wrapper.drag-over {
    border-color: var(--accent-color);
    border-style: solid;
    background: rgba(201, 152, 77, 0.06);
  }

  .light-theme .file-upload-wrapper.drag-over {
    background: rgba(1, 79, 153, 0.06);
  }

  .zone-icon {
    color: var(--muted-color);
    margin-bottom: 10px;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.25s ease;
  }

  .file-upload-wrapper:hover .zone-icon,
  .file-upload-wrapper.drag-over .zone-icon {
    color: var(--accent-color);
    transform: translateY(-5px);
  }

  .file-upload-wrapper.drag-over .zone-icon {
    animation: zone-bounce 0.55s ease infinite;
  }

  @keyframes zone-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .zone-title {
    font-size: 0.88rem;
    color: var(--muted-color);
    margin-bottom: 14px;
    font-weight: 500;
  }

  .upload-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--muted-color);
    font-size: 0.88rem;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upload-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background: rgba(201, 152, 77, 0.05);
  }

  .light-theme .upload-btn:hover {
    background: rgba(1, 79, 153, 0.05);
  }

  .upload-btn.primary {
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
    border-color: transparent;
    font-weight: 600;
  }

  .upload-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-color);
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
  }

  .drop-hint {
    margin: 12px 0 0;
    font-size: 0.78rem;
    color: var(--muted-color);
    opacity: 0.55;
  }

  /* Sort Buttons */
  .sort-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 3px;
    width: 100%;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 7px 6px;
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--muted-color);
    font-size: 0.76rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
    line-height: 1.25;
    word-break: break-word;
    hyphens: auto;
    min-width: 0;
  }

  .sort-btn:hover {
    color: var(--text-color);
  }

  .sort-btn.active {
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
    box-shadow: 0 2px 8px var(--shadow-color);
  }

  /* Checkbox */
  .checkbox-option {
    margin-top: 10px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary, #666);
  }

  .checkbox-label input[type='checkbox'] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--accent-color);
  }

  .checkbox-text {
    user-select: none;
  }
</style>
