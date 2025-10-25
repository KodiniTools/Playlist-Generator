<template>
  <section class="form-section">
    <h2 class="section-title">{{ t('config_title') }}</h2>
    <form id="playlistForm" @submit.prevent>
      <div class="form-group">
        <label for="fileInput">{{ t('label_files') }}</label>
        <input 
          type="file" 
          id="fileInput" 
          multiple 
          accept=".mp3,.wav,.flac"
          @change="handleFileChange"
          ref="fileInputRef"
        >
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
