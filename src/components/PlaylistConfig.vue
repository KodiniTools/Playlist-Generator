<template>
  <section class="form-section">
    <h2 class="section-title">{{ t('config_title') }}</h2>
    <form id="playlistForm" @submit.prevent>
      <div class="form-group">
        <label for="fileInput">{{ t('label_files') }}</label>
        <div class="file-upload-wrapper">
          <input
            type="file"
            id="fileInput"
            class="file-upload-input"
            multiple
            accept=".mp3,.wav,.flac"
            @change="handleFileChange"
            ref="fileInputRef"
          >
          <label for="fileInput" class="file-upload-label">
            <span class="upload-icon">
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </span>
            <span class="upload-text">{{ files.length > 0 ? files.length + ' ' + t('files_selected') : t('click_to_upload') }}</span>
          </label>
        </div>
      </div>

      <FileListCanvas
        :files="files"
        @clear="handleClear"
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

      <button
        type="button"
        class="generate-button"
        @click="$emit('generate')"
      >
        {{ t('button_create') }}
      </button>
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
  playlistName: String
})

const emit = defineEmits(['update:sortOption', 'update:playlistName', 'generate', 'addFiles', 'clearFiles', 'sortFiles'])

const { t } = useTranslation()
const fileInputRef = ref(null)

const handleFileChange = (e) => {
  emit('addFiles', e.target.files)
}

const handleClear = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('clearFiles')
}

const handleSortChange = (e) => {
  emit('update:sortOption', e.target.value)
  emit('sortFiles')
}

const handleNameChange = (e) => {
  emit('update:playlistName', e.target.value)
}
</script>
