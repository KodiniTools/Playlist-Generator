<template>
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

    <footer class="site-footer">
      <form action="https://www.paypal.com/donate" method="post" target="_top" class="donate-form">
        <input type="hidden" name="hosted_button_id" value="8RGLGQ2BFMHU6" />
        <button type="submit" class="donate-button" :title="t('donate_title')">
          <svg class="paypal-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.62h6.597c2.179 0 3.893.603 5.091 1.791.602.598 1.014 1.291 1.223 2.063.219.796.264 1.724.13 2.758l-.015.1v.46l.358.205c.302.167.543.361.729.583.306.366.508.815.601 1.333.096.532.086 1.166-.028 1.884-.13.828-.355 1.551-.668 2.147a4.467 4.467 0 0 1-1.081 1.393c-.426.37-.932.653-1.504.84-.559.182-1.192.273-1.882.273H14.1a.947.947 0 0 0-.937.803l-.036.21-.604 3.832-.028.168a.947.947 0 0 1-.936.803H7.076Z"/>
          </svg>
          {{ t('donate_button') }}
        </button>
      </form>
    </footer>
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
