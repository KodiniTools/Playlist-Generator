<template>
  <!-- Abstände am inneren Element: App.vue misst die Höhe von <nav> per contentRect -->
  <nav class="desktop-bar" :aria-label="t('desktop_bar_label')" data-testid="desktop-bar">
    <div class="desktop-bar__inner">
      <span class="desktop-bar__brand">Playlist Generator</span>
      <div class="desktop-bar__controls">
        <UiSegmentedControl
          v-model="language"
          :options="languageOptions"
          :label="t('desktop_language')"
          size="sm"
        />
        <UiSegmentedControl
          v-model="theme"
          :options="themeOptions"
          :label="t('desktop_theme')"
          size="sm"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { UiSegmentedControl, type SegmentedOption } from '../ui'
  import { useTranslation } from '../../composables/useTranslation'
  import { useTheme } from '../../composables/useTheme'

  /**
   * Nur Desktop-App: Ersatz für die SSI-Navigation des Servers, die dort fehlt.
   * Sprache und Farbschema laufen über dieselben Composables wie im Web
   * (gleiche localStorage-Schlüssel, body.light-theme, html[data-theme]).
   */
  const { t, currentLanguage, setLanguage } = useTranslation()
  const { currentTheme, setTheme } = useTheme()

  const languageOptions: SegmentedOption[] = [
    { value: 'de', label: 'DE' },
    { value: 'en', label: 'EN' },
  ]

  const themeOptions = computed<SegmentedOption[]>(() => [
    { value: 'dark', label: t.value('desktop_theme_dark') },
    { value: 'light', label: t.value('desktop_theme_light') },
  ])

  const language = computed({
    get: () => currentLanguage.value,
    set: (lang: string) => setLanguage(lang),
  })

  const theme = computed({
    get: () => currentTheme.value,
    set: (value: string) => setTheme(value === 'light' ? 'light' : 'dark'),
  })
</script>

<style scoped>
  .desktop-bar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-3);
    padding: var(--ds-space-2) var(--ds-gutter);
    background: var(--ds-surface-1);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }

  .desktop-bar__brand {
    font-weight: 600;
    color: var(--ds-text);
  }

  .desktop-bar__controls {
    display: flex;
    gap: var(--ds-space-2);
    flex-wrap: wrap;
  }
</style>
