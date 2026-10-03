<template>
  <header class="app-header">
    <div class="app-header__inner">
      <nav class="app-header__nav" :aria-label="t('nav_label')">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="app-header__link"
          exact-active-class="app-header__link--active"
        >
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>
      <div v-if="$slots.actions" class="app-header__actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  import { useTranslation } from '../composables/useTranslation'

  /**
   * Gemeinsame Seitennavigation aller Vue-Seiten unterhalb der externen SSI-Navigation.
   * Die aktive Seite markiert der Router (exakter Pfad), rechts optional Aktionen
   * (z. B. der Tastaturkürzel-Button). Höhe = --ds-topbar-height.
   */
  const { t } = useTranslation()

  const items: ReadonlyArray<{ to: string; labelKey: string }> = [
    { to: '/', labelKey: 'nav_home' },
    { to: '/app', labelKey: 'nav_app' },
    { to: '/faq', labelKey: 'nav_faq' },
    { to: '/blog', labelKey: 'nav_blog' },
  ]
</script>

<style scoped>
  .app-header {
    background: var(--ds-surface-1);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
  }

  .app-header__inner {
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    min-height: var(--ds-topbar-height);
    max-width: var(--ds-container);
    margin: 0 auto;
    padding: var(--ds-space-2) var(--ds-gutter);
    box-sizing: border-box;
  }

  .app-header__nav {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
  }

  .app-header__link {
    display: inline-flex;
    align-items: center;
    height: var(--ds-control-sm);
    padding: 0 var(--ds-space-3);
    border-radius: var(--ds-radius-sm);
    color: var(--ds-text-2);
    font-size: var(--ds-text-md);
    font-weight: var(--ds-weight-medium);
    text-decoration: none;
    transition:
      background-color var(--ds-duration) var(--ds-ease),
      color var(--ds-duration) var(--ds-ease);
  }

  .app-header__link:hover {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }

  .app-header__link:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  .app-header__link--active {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }

  .app-header__actions {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    margin-left: auto;
  }

  @media (max-width: 480px) {
    .app-header__link {
      padding: 0 var(--ds-space-2);
      font-size: var(--ds-text-sm);
    }
  }
</style>
