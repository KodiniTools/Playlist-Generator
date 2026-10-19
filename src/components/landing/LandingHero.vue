<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">{{ t('hero_title') }}</h1>
      <p class="hero-subtitle">{{ t('hero_subtitle') }}</p>
      <p class="hero-description">{{ t('hero_description') }}</p>
      <div class="hero-buttons">
        <UiButton to="/app" variant="primary" size="lg">{{ t('hero_cta') }}</UiButton>
        <UiButton href="#features" variant="secondary" size="lg">
          {{ t('hero_learn_more') }}
        </UiButton>
      </div>

      <!-- Trust Badges -->
      <div class="trust-badges">
        <span class="trust-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ t('trust_free') }}
        </span>
        <span class="trust-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ t('trust_no_registration') }}
        </span>
        <span class="trust-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ t('trust_private') }}
        </span>
      </div>
    </div>

    <!-- App Preview -->
    <div class="app-preview">
      <div class="preview-window">
        <div class="preview-titlebar">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
          <span class="preview-title-text">Audio Playlist Generator</span>
        </div>
        <div class="preview-body">
          <div class="preview-sidebar">
            <div class="preview-section-label">{{ t('preview_files_label') }}</div>
            <div class="preview-track-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Summer_Mix.mp3
            </div>
            <div class="preview-track-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Chill_Vibes.mp3
            </div>
            <div class="preview-track-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Road_Trip.flac
            </div>
            <div class="preview-track-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Evening_Jazz.wav
            </div>
            <div class="preview-track-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Workout_Beats.mp3
            </div>
          </div>
          <div class="preview-output">
            <div class="preview-section-label">{{ t('preview_output_label') }}</div>
            <div class="preview-code">
              <span class="code-comment">#EXTM3U</span><br />
              <span class="code-comment">#EXTINF:0,Summer Mix</span><br />
              <span class="code-path">Summer_Mix.mp3</span><br />
              <span class="code-comment">#EXTINF:0,Chill Vibes</span><br />
              <span class="code-path active-line">Chill_Vibes.mp3</span><br />
              <span class="code-comment">#EXTINF:0,Road Trip</span><br />
              <span class="code-path">Road_Trip.flac</span>
            </div>
            <div class="preview-actions">
              <span class="preview-btn">M3U</span>
              <span class="preview-btn">XSPF</span>
              <span class="preview-btn active-btn">JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <a href="#features" class="scroll-indicator" :aria-label="t('hero_learn_more')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </a>
  </section>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'
  import { UiButton } from '../ui'

  const { t } = useTranslation()
</script>

<style scoped>
  /* Hero */
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--ds-topbar-height) - var(--external-nav-height, 0px));
    padding: var(--ds-space-16) var(--ds-gutter) var(--ds-space-10);
    text-align: center;
  }

  .hero-content {
    max-width: 760px;
    margin-bottom: var(--ds-space-12);
  }

  /* Display-Größe nur hier: die Token-Skala endet bei 32 px. */
  .hero-title {
    margin: 0 0 var(--ds-space-4);
    font-size: clamp(var(--ds-text-3xl), 2rem + 1.5vw, 48px);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
    color: var(--ds-text);
  }

  .hero-subtitle {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-xl);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-text);
  }

  .hero-description {
    margin: 0 0 var(--ds-space-8);
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .hero-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ds-space-3);
    margin-bottom: var(--ds-space-6);
  }

  .trust-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--ds-space-5);
  }

  .trust-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-size: var(--ds-text-sm);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-text-2);
  }

  .trust-badge svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    flex-shrink: 0;
    color: var(--ds-success);
  }

  /* App-Vorschau */
  .app-preview {
    width: 100%;
    max-width: 820px;
    margin-bottom: var(--ds-space-10);
  }

  .preview-window {
    overflow: hidden;
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
    text-align: left;
  }

  .preview-titlebar {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-3) var(--ds-space-4);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    background: var(--ds-surface-2);
  }

  .dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: var(--ds-radius-full);
  }

  .dot-red {
    background: var(--ds-danger);
  }

  .dot-yellow {
    background: var(--ds-warning);
  }

  .dot-green {
    background: var(--ds-success);
  }

  .preview-title-text {
    margin-left: var(--ds-space-2);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-text-3);
  }

  .preview-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 200px;
  }

  .preview-sidebar {
    padding: var(--ds-space-4);
    border-right: var(--ds-border-width) solid var(--ds-border);
  }

  .preview-output {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4);
  }

  .preview-section-label {
    margin-bottom: var(--ds-space-2);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-semibold);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ds-text-3);
  }

  .preview-track-item {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    margin-bottom: var(--ds-space-1);
    padding: var(--ds-space-1) var(--ds-space-2);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-text-sm);
    color: var(--ds-text-2);
  }

  .preview-track-item svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    flex-shrink: 0;
    color: var(--ds-text-3);
  }

  .preview-track-item.active {
    background: var(--ds-accent-soft);
    color: var(--ds-text);
  }

  .preview-track-item.active svg {
    color: var(--ds-accent);
  }

  .preview-code {
    flex: 1;
    padding: var(--ds-space-3) var(--ds-space-4);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-0);
    font-family: var(--ds-font-mono);
    font-size: var(--ds-text-xs);
    line-height: 1.7;
  }

  .code-comment {
    color: var(--ds-text-3);
  }

  .code-path {
    color: var(--ds-text);
  }

  .code-path.active-line {
    padding: 0 var(--ds-space-1);
    border-radius: var(--ds-radius-sm);
    background: var(--ds-accent-soft);
    color: var(--ds-accent);
  }

  .preview-actions {
    display: flex;
    gap: var(--ds-space-2);
  }

  .preview-btn {
    padding: var(--ds-space-1) var(--ds-space-3);
    border: var(--ds-border-width) solid var(--ds-border-strong);
    border-radius: var(--ds-radius-sm);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text-2);
  }

  .preview-btn.active-btn {
    border-color: var(--ds-accent);
    background: var(--ds-accent);
    color: var(--ds-on-accent);
  }

  /* Hinweis zum Weiterscrollen */
  .scroll-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-lg);
    height: var(--ds-control-lg);
    border-radius: var(--ds-radius-full);
    color: var(--ds-text-3);
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      color var(--ds-duration) var(--ds-ease);
  }

  .scroll-indicator:hover {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }

  .scroll-indicator:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .scroll-indicator svg {
    width: var(--ds-icon-md);
    height: var(--ds-icon-md);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .preview-body {
      grid-template-columns: 1fr;
    }

    .preview-sidebar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-space-1);
      border-right: none;
      border-bottom: var(--ds-border-width) solid var(--ds-border);
    }

    .preview-sidebar .preview-section-label {
      width: 100%;
      margin-bottom: var(--ds-space-1);
    }

    .preview-track-item {
      margin-bottom: 0;
    }
  }

  @media (max-width: 600px) {
    .hero-buttons {
      flex-direction: column;
      align-items: stretch;
      max-width: 320px;
      margin-inline: auto;
    }
  }

  @media (max-width: 480px) {
    .hero {
      min-height: auto;
      padding: var(--ds-space-8) var(--ds-space-4) var(--ds-space-6);
    }

    .hero-content {
      margin-bottom: var(--ds-space-8);
    }

    .hero-subtitle {
      font-size: var(--ds-text-lg);
    }

    .hero-description {
      margin-bottom: var(--ds-space-5);
      font-size: var(--ds-text-md);
    }

    .app-preview {
      margin-bottom: var(--ds-space-5);
    }

    .trust-badges {
      gap: var(--ds-space-3);
    }
  }
</style>
