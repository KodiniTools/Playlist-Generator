<template>
  <a href="https://kodinitools.top" class="home-icon" title="Zurück zu KodiniTools.top">🏠</a>
  
  <div class="page-controls">
    <LanguageSwitcher />
    <ThemeSwitcher />
  </div>
  
  <main class="container">
    <header>
      <h1>{{ t('main_title') }}</h1>
      <p class="subtitle">{{ t('subtitle') }}</p>
    </header>

    <section class="description">
      <p>{{ t('description_text') }}</p>
    </section>

    <section class="important-notice">
      <span class="notice-icon">⚠️</span>
      <p>{{ t('notice_m3u') }}</p>
    </section>

    <div class="main-content">
      <PlaylistConfig 
        :files="files"
        :sortOption="sortOption"
        :playlistName="playlistName"
        @update:sortOption="sortOption = $event"
        @update:playlistName="playlistName = $event"
        @addFiles="handleAddFiles"
        @clearFiles="clearFiles"
        @sortFiles="sortFiles"
        @generate="generatePlaylist"
      />

      <PlaylistPreview 
        :outputFormat="outputFormat"
        :playlistContent="playlistContent"
        @update:outputFormat="handleFormatChange"
        @save="handleSave"
        @generate="generatePlaylist"
      />
    </div>

    <ToolsGrid />
    <FAQ />
  </main>
</template>

<script setup>
import { watch } from 'vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import PlaylistConfig from './components/PlaylistConfig.vue'
import PlaylistPreview from './components/PlaylistPreview.vue'
import ToolsGrid from './components/ToolsGrid.vue'
import FAQ from './components/FAQ.vue'
import { useTranslation } from './composables/useTranslation'
import { usePlaylist } from './composables/usePlaylist'

const { t } = useTranslation()
const { 
  files, 
  sortOption, 
  playlistName, 
  outputFormat, 
  playlistContent,
  addFiles,
  clearFiles,
  sortFiles,
  generatePlaylist,
  savePlaylist
} = usePlaylist()

const handleAddFiles = (fileList) => {
  addFiles(fileList)
}

const handleFormatChange = (format) => {
  outputFormat.value = format
}

const handleSave = async () => {
  if (!playlistContent.value) {
    alert(t.value('alert_create_first'))
    return
  }
  
  const result = await savePlaylist()
  if (result === false) {
    alert(t.value('alert_save_error'))
  }
}

// Watch for sortOption changes
watch(sortOption, () => {
  sortFiles()
})
</script>
