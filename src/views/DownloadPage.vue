<template>
  <div class="download-page">
    <AppHeader />

    <main class="download-container">
      <header class="download-hero">
        <span class="download-hero__eyebrow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          {{ t('download_eyebrow') }}
        </span>
        <h1>{{ t('download_title') }}</h1>
        <p class="download-hero__subtitle">{{ t('download_subtitle') }}</p>
        <p class="download-hero__requirements">{{ t('download_requirements') }}</p>
      </header>

      <section class="download-files" :aria-label="t('download_files_label')">
        <div class="download-files__grid">
          <article
            v-for="item in DESKTOP_DOWNLOADS"
            :key="item.key"
            class="file-card"
            :class="{ 'file-card--recommended': item.recommended }"
            :data-download="item.key"
          >
            <span v-if="item.recommended" class="file-card__badge">
              {{ t('download_recommended') }}
            </span>
            <h2>{{ t(item.title) }}</h2>
            <p>{{ t(item.description) }}</p>
            <p class="file-card__name">{{ item.file }}</p>
            <UiButton
              :href="downloadUrl(item.file)"
              :variant="item.recommended ? 'primary' : 'secondary'"
              download
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </template>
              {{ t('download_button').replace('{ext}', fileExtension(item.file)) }}
            </UiButton>
          </article>
        </div>
        <p class="download-files__note">{{ t('download_size_note') }}</p>
      </section>

      <section class="download-notes" aria-labelledby="download-notes-heading">
        <h2 id="download-notes-heading">{{ t('download_notes_title') }}</h2>
        <div class="download-notes__list">
          <div v-for="note in notes" :key="note.title" class="note-item">
            <h3>{{ t(note.title) }}</h3>
            <p>{{ t(note.text) }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import AppHeader from '../components/AppHeader.vue'
  import { UiButton } from '../components/ui'
  import { useTranslation, type TranslationKey } from '../composables/useTranslation'
  import { DESKTOP_DOWNLOADS, downloadUrl, fileExtension } from '../utils/desktopDownloads'

  /**
   * Download-Seite der Windows-App (wie /bildkonverter/download). Die Dateien
   * liegen auf dem Server unter downloads/ (deploy-downloads.sh, DESKTOP.md).
   */
  const { t } = useTranslation()

  const notes: ReadonlyArray<{ title: TranslationKey; text: TranslationKey }> = [
    { title: 'download_note_smartscreen_title', text: 'download_note_smartscreen_text' },
    { title: 'download_note_offline_title', text: 'download_note_offline_text' },
    { title: 'download_note_webview_title', text: 'download_note_webview_text' },
  ]
</script>

<style scoped>
  .download-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

  .download-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: var(--ds-space-16) var(--ds-gutter);
  }

  .download-hero {
    margin-bottom: var(--ds-space-10);
    text-align: center;
  }

  .download-hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-1) var(--ds-space-3);
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-full);
  }

  .download-hero__eyebrow svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
  }

  .download-hero h1 {
    margin: var(--ds-space-4) 0 var(--ds-space-3);
    font-size: var(--ds-text-3xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
    color: var(--ds-text);
  }

  .download-hero__subtitle {
    max-width: 640px;
    margin: 0 auto var(--ds-space-3);
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .download-hero__requirements {
    margin: 0;
    font-size: var(--ds-text-sm);
    color: var(--ds-text-3);
  }

  .download-files {
    margin-bottom: var(--ds-space-12);
  }

  .download-files__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--ds-space-6);
  }

  .file-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--ds-space-8) var(--ds-space-6) var(--ds-space-6);
    text-align: center;
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    transition: border-color var(--ds-duration) var(--ds-ease);
  }

  .file-card:hover {
    border-color: var(--ds-border-strong);
  }

  .file-card--recommended,
  .file-card--recommended:hover {
    border-color: var(--ds-accent);
  }

  .file-card h2 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-bold);
    color: var(--ds-text);
  }

  .file-card p {
    margin: 0 0 var(--ds-space-3);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .file-card .file-card__name {
    margin-top: auto;
    margin-bottom: var(--ds-space-4);
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-xs);
    color: var(--ds-text-3);
    word-break: break-all;
  }

  .file-card__badge {
    position: absolute;
    top: calc(-1 * var(--ds-space-3));
    left: 50%;
    transform: translateX(-50%);
    padding: var(--ds-space-1) var(--ds-space-3);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-bold);
    white-space: nowrap;
    color: var(--ds-on-accent);
    background: var(--ds-accent);
    border-radius: var(--ds-radius-full);
  }

  .download-files__note {
    max-width: 640px;
    margin: var(--ds-space-6) auto 0;
    font-size: var(--ds-text-sm);
    text-align: center;
    color: var(--ds-text-3);
  }

  .download-notes {
    padding-top: var(--ds-space-10);
    border-top: var(--ds-border-width) solid var(--ds-border);
  }

  .download-notes h2 {
    margin: 0 0 var(--ds-space-8);
    font-size: var(--ds-text-xl);
    font-weight: var(--ds-weight-bold);
    text-align: center;
    color: var(--ds-text);
  }

  .download-notes__list {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-4);
    max-width: 900px;
    margin: 0 auto;
  }

  .note-item {
    padding: var(--ds-space-5) var(--ds-space-6);
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
  }

  .note-item h3 {
    margin: 0 0 var(--ds-space-1);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-bold);
    color: var(--ds-text);
  }

  .note-item p {
    margin: 0;
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }
</style>
