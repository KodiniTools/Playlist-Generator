<template>
  <div class="landing-page">
    <AppHeader />

    <!-- Hero Section -->
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

    <!-- Feature Cards Grid -->
    <div class="feature-cards-wrapper">
      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
              <path d="M12 7v10" />
              <path d="m9 10 3-3 3 3" />
              <path d="m9 14 3 3 3-3" />
            </svg>
          </div>
          <h3>{{ t('feature1_title') }}</h3>
          <p>{{ t('feature1_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3>{{ t('feature2_title') }}</h3>
          <p>{{ t('feature2_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="10" y1="3" x2="8" y2="21" />
              <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
          </div>
          <h3>{{ t('feature3_title') }}</h3>
          <p>{{ t('feature3_desc') }}</p>
        </div>
      </div>
    </div>

    <!-- Features Details Section -->
    <section id="features" class="details-section">
      <div class="section-header">
        <h2>{{ t('details_title') }}</h2>
        <p>{{ t('details_subtitle') }}</p>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>{{ t('detail1_title') }}</h3>
          <p>{{ t('detail1_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <h3>{{ t('detail2_title') }}</h3>
          <p>{{ t('detail2_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.001" />
              <path d="M10 8h.001" />
              <path d="M14 8h.001" />
              <path d="M18 8h.001" />
              <path d="M8 12h.001" />
              <path d="M12 12h.001" />
              <path d="M16 12h.001" />
              <path d="M7 16h10" />
            </svg>
          </div>
          <h3>{{ t('detail3_title') }}</h3>
          <p>{{ t('detail3_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </div>
          <h3>{{ t('detail4_title') }}</h3>
          <p>{{ t('detail4_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path
                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
          </div>
          <h3>{{ t('detail5_title') }}</h3>
          <p>{{ t('detail5_desc') }}</p>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
              />
            </svg>
          </div>
          <h3>{{ t('detail6_title') }}</h3>
          <p>{{ t('detail6_desc') }}</p>
        </div>
      </div>
    </section>

    <!-- KodiniTools Section -->
    <section id="kodinitools" class="tools-section" aria-labelledby="tools-heading">
      <div class="section-header">
        <h2 id="tools-heading">{{ t('landing_tools_title') }}</h2>
        <p>{{ t('landing_tools_subtitle') }}</p>
      </div>

      <div class="tools-cards">
        <a
          v-for="tool in kodiniTools"
          :key="tool.id"
          :href="tool.url"
          class="tool-link-card"
          :data-tool="tool.id"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="tool-link-icon">
            <svg
              v-if="tool.id === 'playlist-converter'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="4" y1="6" x2="14" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="10" y2="18" />
              <polyline points="17 9 21 13 17 17" />
              <line x1="21" y1="13" x2="14" y2="13" />
            </svg>
            <svg
              v-else-if="tool.id === 'audio-converter'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </div>
          <h3>{{ t(tool.titleKey) }}</h3>
          <p>{{ t(tool.descKey) }}</p>
          <span class="tool-link-cta">
            {{ t('landing_tool_link') }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span class="sr-only">({{ t('landing_tool_link_aria') }})</span>
          </span>
        </a>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">{{ t('cta_title') }}</h2>
        <p class="cta-desc">{{ t('cta_desc') }}</p>
        <UiButton to="/app" variant="primary" size="lg">{{ t('cta_button') }}</UiButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../composables/useTranslation'
  import AppHeader from '../components/AppHeader.vue'
  import { UiButton } from '../components/ui'

  const { t } = useTranslation()

  /** Externe KodiniTools, die auf der Landingpage beworben werden. */
  interface KodiniTool {
    id: 'playlist-converter' | 'audio-converter' | 'audio-normalizer'
    url: string
    titleKey: string
    descKey: string
  }

  const kodiniTools: readonly KodiniTool[] = [
    {
      id: 'playlist-converter',
      url: 'https://kodinitools.com/playlistkonverter/',
      titleKey: 'landing_tool_playlist_converter_title',
      descKey: 'landing_tool_playlist_converter_desc',
    },
    {
      id: 'audio-converter',
      url: 'https://kodinitools.com/audiokonverter/',
      titleKey: 'landing_tool_audio_converter_title',
      descKey: 'landing_tool_audio_converter_desc',
    },
    {
      id: 'audio-normalizer',
      url: 'https://kodinitools.com/audionormalisierer/',
      titleKey: 'landing_tool_normalizer_title',
      descKey: 'landing_tool_normalizer_desc',
    },
  ]
</script>

<style scoped>
  .landing-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

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

  /* Feature-Karten */
  .feature-cards-wrapper {
    display: flex;
    justify-content: center;
    padding: 0 var(--ds-gutter) var(--ds-space-16);
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ds-gap);
    width: 100%;
    max-width: 1100px;
  }

  .feature-card {
    padding: var(--ds-space-8) var(--ds-space-6);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
    text-align: center;
    transition: border-color var(--ds-duration) var(--ds-ease);
  }

  .feature-card:hover {
    border-color: var(--ds-border-strong);
  }

  .feature-card__icon,
  .tool-link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-space-12);
    height: var(--ds-space-12);
    margin: 0 auto var(--ds-space-4);
    border-radius: var(--ds-radius-md);
    background: var(--ds-accent-soft);
    color: var(--ds-accent);
  }

  .feature-card__icon svg,
  .tool-link-icon svg {
    width: var(--ds-space-6);
    height: var(--ds-space-6);
  }

  .feature-card h3,
  .detail-item h3,
  .tool-link-card h3 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .feature-card p,
  .detail-item p,
  .tool-link-card p {
    margin: 0;
    font-size: var(--ds-text-md);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  /* Details */
  .details-section {
    padding: var(--ds-space-16) var(--ds-gutter);
    border-top: var(--ds-border-width) solid var(--ds-border);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    background: var(--ds-surface-1);
  }

  .section-header {
    max-width: 600px;
    margin: 0 auto var(--ds-space-12);
    text-align: center;
  }

  .section-header h2 {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-3xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
    color: var(--ds-text);
  }

  .section-header p {
    margin: 0;
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ds-space-8);
    max-width: 1100px;
    margin: 0 auto;
  }

  .detail-item {
    padding: var(--ds-space-6) var(--ds-space-5);
    border: var(--ds-border-width) solid transparent;
    border-radius: var(--ds-radius-lg);
    text-align: center;
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      border-color var(--ds-duration) var(--ds-ease);
  }

  .detail-item:hover {
    border-color: var(--ds-border);
    background: var(--ds-surface-2);
  }

  .detail-icon {
    width: var(--ds-space-10);
    height: var(--ds-space-10);
    margin: 0 auto var(--ds-space-4);
    color: var(--ds-accent);
  }

  .detail-icon svg {
    width: 100%;
    height: 100%;
  }

  /* KodiniTools */
  .tools-section {
    padding: var(--ds-space-16) var(--ds-gutter);
  }

  .tools-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ds-gap);
    max-width: 1100px;
    margin: 0 auto;
  }

  .tool-link-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--ds-space-8) var(--ds-space-6);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
    color: inherit;
    text-align: center;
    text-decoration: none;
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      border-color var(--ds-duration) var(--ds-ease);
  }

  .tool-link-card:hover {
    border-color: var(--ds-border-strong);
    background: var(--ds-surface-2);
  }

  .tool-link-card:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .tool-link-card p {
    flex-grow: 1;
    margin-bottom: var(--ds-space-4);
  }

  .tool-link-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--ds-space-2);
    font-size: var(--ds-text-md);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-link);
  }

  .tool-link-cta svg {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Abschluss */
  .cta-section {
    padding: 0 var(--ds-gutter) var(--ds-space-16);
    text-align: center;
  }

  .cta-content {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--ds-space-12) var(--ds-space-10);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
  }

  .cta-title {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .cta-desc {
    margin: 0 0 var(--ds-space-6);
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .feature-cards,
    .tools-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-width: 720px;
    }

    .details-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ds-space-6);
    }

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
    .feature-cards,
    .tools-cards,
    .details-grid {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin-inline: auto;
    }

    .details-grid {
      gap: var(--ds-space-4);
    }

    .hero-buttons {
      flex-direction: column;
      align-items: stretch;
      max-width: 320px;
      margin-inline: auto;
    }

    .section-header {
      margin-bottom: var(--ds-space-8);
    }

    .section-header h2 {
      font-size: var(--ds-text-2xl);
    }

    .details-section,
    .tools-section {
      padding: var(--ds-space-12) var(--ds-space-4);
    }

    .feature-cards-wrapper,
    .cta-section {
      padding: 0 var(--ds-space-4) var(--ds-space-12);
    }

    .cta-content {
      padding: var(--ds-space-8) var(--ds-space-6);
    }

    .cta-title {
      font-size: var(--ds-text-xl);
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

    .feature-card,
    .tool-link-card {
      padding: var(--ds-space-6) var(--ds-space-4);
    }
  }
</style>
