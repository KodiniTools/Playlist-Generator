<template>
  <section id="kodinitools" class="tools-section" aria-labelledby="tools-heading">
    <div class="container">
      <h2 id="tools-heading" class="section-title">{{ t('landing_tools_title') }}</h2>
      <p class="section-lead">{{ t('landing_tools_subtitle') }}</p>

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
          <div class="feature-icon">
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
