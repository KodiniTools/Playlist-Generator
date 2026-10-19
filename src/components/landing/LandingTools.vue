<template>
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
</template>

<script setup lang="ts">
  import { useTranslation, type TranslationKey } from '../../composables/useTranslation'

  const { t } = useTranslation()

  /** Externe KodiniTools, die auf der Landingpage beworben werden. */
  interface KodiniTool {
    id: 'playlist-converter' | 'audio-converter' | 'audio-normalizer'
    url: string
    titleKey: TranslationKey
    descKey: TranslationKey
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
  /* Feature-Karten */

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

  .tool-link-icon svg {
    width: var(--ds-space-6);
    height: var(--ds-space-6);
  }

  .tool-link-card h3 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .tool-link-card p {
    margin: 0;
    font-size: var(--ds-text-md);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  /* Details */

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

  /* Responsive */
  @media (max-width: 900px) {
    .tools-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-width: 720px;
    }
  }

  @media (max-width: 600px) {
    .tools-cards {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin-inline: auto;
    }

    .section-header {
      margin-bottom: var(--ds-space-8);
    }

    .section-header h2 {
      font-size: var(--ds-text-2xl);
    }

    .tools-section {
      padding: var(--ds-space-12) var(--ds-space-4);
    }
  }

  @media (max-width: 480px) {
    .tool-link-card {
      padding: var(--ds-space-6) var(--ds-space-4);
    }
  }
</style>
