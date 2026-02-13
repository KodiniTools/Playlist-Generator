<template>
  <div class="app-page">
    <!-- Page Header Navigation -->
    <header class="page-header">
      <div class="header-container">
        <nav class="header-nav">
          <router-link to="/" class="nav-link">{{ t('nav_home') }}</router-link>
          <router-link to="/app" class="nav-link active">{{ t('nav_app') }}</router-link>
          <router-link to="/faq" class="nav-link">{{ t('nav_faq') }}</router-link>
          <router-link to="/blog" class="nav-link">{{ t('nav_blog') }}</router-link>
        </nav>
      </div>
    </header>

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
          ref="playlistConfigRef"
          :files="files"
          :sortOption="sortOption"
          :playlistName="playlistName"
          :replaceMode="replaceMode"
          :selectedFileIndex="selectedFileIndex"
          @update:sortOption="sortOption = $event"
          @update:playlistName="playlistName = $event"
          @update:replaceMode="replaceMode = $event"
          @update:selectedFileIndex="selectedFileIndex = $event"
          @addFiles="handleAddFiles"
          @clearFiles="clearFiles"
          @removeFile="removeFile"
          @moveFile="moveFile"
          @sortFiles="sortFiles"
        />

        <PlaylistPreview
          :outputFormat="outputFormat"
          :playlistContent="playlistContent"
          :files="files"
          @update:outputFormat="handleFormatChange"
          @save="handleSave"
        />
      </div>

      <ToolsGrid />

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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PlaylistConfig from '../components/PlaylistConfig.vue'
import PlaylistPreview from '../components/PlaylistPreview.vue'
import ToolsGrid from '../components/ToolsGrid.vue'
import { useTranslation } from '../composables/useTranslation'
import { usePlaylist } from '../composables/usePlaylist'
import { useToast } from '../composables/useToast'

const { t } = useTranslation()
const toast = useToast()
const {
  files,
  sortOption,
  playlistName,
  outputFormat,
  playlistContent,
  replaceMode,
  selectedFileIndex,
  addFiles,
  clearFiles,
  removeFile,
  moveFile,
  sortFiles,
  savePlaylist
} = usePlaylist()

// Template refs for child components
const playlistConfigRef = ref(null)

const handleAddFiles = (fileList) => {
  const { added, skipped } = addFiles(fileList)
  if (added > 0) {
    toast.info(t.value('toast_files_added').replace('{count}', added))
  }
  if (skipped > 0) {
    toast.info(t.value('toast_duplicates_skipped').replace('{count}', skipped))
  }
}

const handleFormatChange = (format) => {
  outputFormat.value = format
}

const handleSave = async () => {
  if (!playlistContent.value) {
    toast.error(t.value('alert_create_first'))
    return
  }

  const result = await savePlaylist()
  if (result === false) {
    toast.error(t.value('alert_save_error'))
  } else {
    toast.success(t.value('toast_playlist_saved'))
  }
}

const handleCopy = async () => {
  if (!playlistContent.value) {
    toast.error(t.value('alert_create_first'))
    return
  }

  try {
    await navigator.clipboard.writeText(playlistContent.value)
    toast.success(t.value('toast_copied'))
  } catch (err) {
    toast.error(t.value('toast_copy_error'))
  }
}

const handleDeleteSelected = () => {
  if (selectedFileIndex.value >= 0 && selectedFileIndex.value < files.value.length) {
    removeFile(selectedFileIndex.value)
    // Adjust selection after removal
    if (selectedFileIndex.value >= files.value.length) {
      selectedFileIndex.value = files.value.length - 1
    }
  }
}

const handleKeyDown = (e) => {
  // Don't capture shortcuts when typing in input/textarea
  const activeEl = document.activeElement
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    return
  }

  // Ctrl+O: Open files
  if (e.ctrlKey && e.key === 'o') {
    e.preventDefault()
    playlistConfigRef.value?.openFileDialog()
  }

  // Ctrl+S: Save playlist
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    handleSave()
  }

  // Ctrl+C: Copy to clipboard (only when no text is selected)
  if (e.ctrlKey && e.key === 'c' && !window.getSelection()?.toString()) {
    e.preventDefault()
    handleCopy()
  }

  // Delete: Remove selected file
  if (e.key === 'Delete') {
    e.preventDefault()
    handleDeleteSelected()
  }

  // Arrow keys for file selection
  if (e.key === 'ArrowDown' && files.value.length > 0) {
    e.preventDefault()
    selectedFileIndex.value = Math.min(selectedFileIndex.value + 1, files.value.length - 1)
  }

  if (e.key === 'ArrowUp' && files.value.length > 0) {
    e.preventDefault()
    selectedFileIndex.value = Math.max(selectedFileIndex.value - 1, 0)
  }

  // Escape: Deselect
  if (e.key === 'Escape') {
    selectedFileIndex.value = -1
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.app-page {
  padding-top: 0;
}

/* Page Header Navigation */
.page-header {
  background: linear-gradient(135deg, rgba(12, 12, 16, 0.95), rgba(22, 22, 28, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.light-theme .page-header {
  background: linear-gradient(135deg, rgba(245, 245, 245, 0.95), rgba(232, 232, 232, 0.95));
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-nav {
  display: flex;
  gap: 30px;
}

.header-nav .nav-link {
  text-decoration: none;
  color: var(--muted-color);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-nav .nav-link:hover,
.header-nav .nav-link.active {
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.1);
}

.light-theme .header-nav .nav-link:hover,
.light-theme .header-nav .nav-link.active {
  background: rgba(162, 134, 128, 0.1);
}

@media (max-width: 768px) {
  .header-nav {
    gap: 15px;
  }

  .header-nav .nav-link {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: fade-in 0.8s ease-out;
}

.container > header {
  text-align: center;
  margin-bottom: 40px;
  animation: slide-in 0.8s ease-out;
}

.container > header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 30px var(--glow-color);
}

.subtitle {
  font-size: 1.1rem;
  color: var(--muted-color);
  margin-bottom: 0;
}

.description {
  background: linear-gradient(135deg,
    rgba(22, 22, 28, 0.8),
    rgba(22, 22, 28, 0.6));
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  backdrop-filter: blur(15px);
  box-shadow: 0 10px 40px var(--shadow-color);
  animation: slide-in 0.8s ease-out 0.2s both;
}

.light-theme .description {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7));
}

.description p {
  font-size: 1rem;
  color: var(--muted-color);
  margin: 0;
  text-align: center;
}

.important-notice {
  background: linear-gradient(135deg,
    rgba(242, 226, 142, 0.15),
    rgba(242, 226, 142, 0.05));
  border: 2px solid var(--warning-color);
  border-radius: 15px;
  padding: 18px;
  margin-bottom: 25px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  animation: slide-in 0.8s ease-out 0.3s both;
}

.light-theme .important-notice {
  background: linear-gradient(135deg,
    rgba(162, 134, 128, 0.15),
    rgba(162, 134, 128, 0.05));
}

.notice-icon {
  font-size: 1.3rem;
  color: var(--warning-color);
  margin-top: 2px;
}

.important-notice p {
  color: var(--text-color);
  margin: 0;
  font-size: 0.9rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
}

.site-footer {
  margin-top: 50px;
  padding: 30px 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.donate-form {
  display: inline-block;
}

.donate-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--muted-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.donate-button:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.05);
}

.light-theme .donate-button:hover {
  background: rgba(162, 134, 128, 0.05);
}

.paypal-icon {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.donate-button:hover .paypal-icon {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 30px 15px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .container > header h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px 10px;
  }

  .container > header {
    margin-bottom: 20px;
  }

  .container > header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .description {
    padding: 15px;
    border-radius: 14px;
    margin-bottom: 15px;
  }

  .description p {
    font-size: 0.9rem;
  }

  .important-notice {
    padding: 12px;
    gap: 10px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .notice-icon {
    font-size: 1.1rem;
  }

  .important-notice p {
    font-size: 0.85rem;
  }

  .main-content {
    gap: 15px;
    margin-bottom: 30px;
  }

  .site-footer {
    margin-top: 25px;
    padding: 20px 0;
  }

  .donate-button {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .header-container {
    padding: 10px 12px;
  }

  .header-nav {
    gap: 6px;
  }

  .header-nav .nav-link {
    padding: 6px 8px;
    font-size: 0.82rem;
  }
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
