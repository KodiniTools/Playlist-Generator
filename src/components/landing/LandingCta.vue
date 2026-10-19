<template>
  <section class="cta-section">
    <div class="cta-content">
      <h2 class="cta-title">{{ t('cta_title') }}</h2>
      <p class="cta-desc">{{ t('cta_desc') }}</p>
      <UiButton to="/app" variant="primary" size="lg">{{ t('cta_button') }}</UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'
  import { UiButton } from '../ui'

  const { t } = useTranslation()
</script>

<style scoped>
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

  @media (max-width: 600px) {
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
</style>
