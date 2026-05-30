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
        >
        <input
          type="file"
          id="folderInput"
          class="file-upload-input"
          webkitdirectory
          @change="handleFolderChange"
          ref="folderInputRef"
        >

        <div
          class="file-upload-wrapper"
          :class="{ 'drag-over': isDragging }"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-buttons">
            <button
              type="button"
              class="upload-btn"
              :title="t('shortcut_open')"
              @click="fileInputRef?.click()"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {{ t('button_add_files') || 'Dateien hinzufügen' }}
            </button>
            <button
              type="button"
              class="upload-btn"
              @click="folderInputRef?.click()"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              {{ t('button_add_folder') || 'Ordner hinzufügen' }}
            </button>
          </div>
          <p class="drop-hint">{{ t('drop_hint') || 'oder Dateien / Ordner hier ablegen' }}</p>
        </div>
        <div class="checkbox-option" v-if="files.length > 0">
          <label class="checkbox-label">
            <input
              type="checkbox"
              :checked="replaceMode"
              @change="handleReplaceModeChange"
            >
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
        <label for="sortOption">{{ t('label_sort') }}</label>
        <select
          id="sortOption"
          :value="sortOption"
          @change="handleSortChange"
        >
          <option value="alphabetical">{{ t('sort_alpha') }}</option>
          <option value="date">{{ t('sort_date') }}</option>
          <option value="random">{{ t('sort_random') }}</option>
          <option value="manual">{{ t('sort_manual') }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="playlistName">{{ t('label_name') }}</label>
        <input
          type="text"
          id="playlistName"
          :placeholder="t('placeholder_name')"
          :value="playlistName"
          @input="handleNameChange"
        >
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import FileListCanvas from './FileListCanvas.vue'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps({
  files: Array,
  sortOption: String,
  playlistName: String,
  replaceMode: Boolean,
  selectedFileIndex: Number
})

const emit = defineEmits(['update:sortOption', 'update:playlistName', 'update:replaceMode', 'update:selectedFileIndex', 'addFiles', 'clearFiles', 'removeFile', 'moveFile', 'sortFiles'])

const handleReplaceModeChange = (e) => {
  emit('update:replaceMode', e.target.checked)
}

const { t } = useTranslation()
const fileInputRef = ref(null)
const folderInputRef = ref(null)
const isDragging = ref(false)
let dragCounter = 0

const AUDIO_EXTENSIONS = /\.(mp3|wav|flac|ogg|aac|m4a|wma|opus)$/i

const handleFileChange = (e) => {
  emit('addFiles', e.target.files)
  e.target.value = ''
}

const handleFolderChange = (e) => {
  const all = e.target.files
  // Filter to audio files only (browser already traverses the tree via webkitdirectory)
  const audio = Array.from(all).filter(f => AUDIO_EXTENSIONS.test(f.name))
  if (audio.length > 0) {
    emit('addFiles', audio)
  }
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

// Recursively read a FileSystemDirectoryEntry and collect audio files
const readDirectoryEntry = (dirEntry) => {
  return new Promise((resolve) => {
    const reader = dirEntry.createReader()
    const results = []

    const readBatch = () => {
      reader.readEntries((entries) => {
        if (!entries.length) {
          resolve(results)
          return
        }
        const promises = entries.map((entry) => {
          if (entry.isFile) {
            return new Promise((res) => {
              entry.file((file) => {
                if (AUDIO_EXTENSIONS.test(file.name)) results.push(file)
                res()
              }, () => res())
            })
          } else if (entry.isDirectory) {
            return readDirectoryEntry(entry).then((files) => results.push(...files))
          }
          return Promise.resolve()
        })
        Promise.all(promises).then(readBatch)
      }, () => resolve(results))
    }

    readBatch()
  })
}

const handleDrop = async (e) => {
  dragCounter = 0
  isDragging.value = false

  const items = e.dataTransfer.items
  if (!items || items.length === 0) return

  const collectedFiles = []

  const promises = Array.from(items).map((item) => {
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
    if (!entry) {
      // Fallback: plain file
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
      return readDirectoryEntry(entry).then((files) => collectedFiles.push(...files))
    }

    return Promise.resolve()
  })

  await Promise.all(promises)

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

const handleSortChange = (e) => {
  emit('update:sortOption', e.target.value)
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
  openFileDialog
})
</script>

<style scoped>
.file-upload-input {
  display: none;
}

.file-upload-wrapper {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.file-upload-wrapper.drag-over {
  border-color: var(--accent-color);
  background: rgba(242, 226, 142, 0.06);
}

.light-theme .file-upload-wrapper.drag-over {
  background: rgba(162, 134, 128, 0.06);
}

.upload-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--muted-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.05);
}

.light-theme .upload-btn:hover {
  background: rgba(162, 134, 128, 0.05);
}

.upload-btn svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.drop-hint {
  margin: 12px 0 0;
  font-size: 0.82rem;
  color: var(--muted-color);
  opacity: 0.65;
}

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

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary-color, #00ff9d);
}

.checkbox-text {
  user-select: none;
}
</style>
