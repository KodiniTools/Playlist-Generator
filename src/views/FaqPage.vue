<template>
  <div class="faq-page">
    <AppHeader />

    <main class="faq-container">
      <header class="content-header">
        <h1>{{ t('faq_page_title') }}</h1>
        <p class="content-header__subtitle">{{ t('faq_page_subtitle') }}</p>
      </header>

      <UiCallout type="success" :title="t('privacy_title')" class="privacy-notice">
        {{ t('privacy_text') }}
      </UiCallout>

      <section class="faq-questions" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="faq-questions__title">{{ t('faq_title') }}</h2>

        <div class="faq-list">
          <details v-for="key in questionKeys" :key="key">
            <summary>{{ t(`${key}_title`) }}</summary>
            <p v-html="t(`${key}_text`)"></p>
          </details>
        </div>
      </section>

      <section class="cta-section">
        <div class="cta-content">
          <h2>{{ t('cta_title') }}</h2>
          <p>{{ t('cta_desc') }}</p>
          <UiButton to="/app" variant="primary" size="lg">{{ t('cta_button') }}</UiButton>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../composables/useTranslation'
  import AppHeader from '../components/AppHeader.vue'
  import { UiButton, UiCallout } from '../components/ui'

  const { t } = useTranslation()

  /** Reihenfolge der Fragen; jeder Schlüssel hat `_title` und `_text` in beiden Sprachen. */
  const questionKeys = [
    'faq_q1',
    'faq_q9',
    'faq_q2',
    'faq_q3',
    'faq_q4',
    'faq_q5',
    'faq_q6',
    'faq_q7',
    'faq_q8',
  ] as const
</script>

<style scoped>
  .faq-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

  .faq-container {
    max-width: 880px;
    margin: 0 auto;
    padding: var(--ds-space-16) var(--ds-gutter);
  }

  .content-header {
    margin-bottom: var(--ds-space-10);
    text-align: center;
  }

  .content-header h1 {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-3xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
    color: var(--ds-text);
  }

  .content-header__subtitle {
    margin: 0;
    font-size: var(--ds-text-lg);
    color: var(--ds-text-2);
  }

  .privacy-notice {
    margin-bottom: var(--ds-space-10);
  }

  /* Fragen */
  .faq-questions {
    margin-bottom: var(--ds-space-12);
  }

  .faq-questions__title {
    margin: 0 0 var(--ds-space-6);
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    text-align: center;
    color: var(--ds-text);
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-3);
  }

  /* Die scoped Regeln überschreiben bewusst die globalen details/summary-Regeln aus main.css. */
  details {
    margin: 0;
    overflow: visible;
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-1);
    box-shadow: none;
    transition: border-color var(--ds-duration) var(--ds-ease);
  }

  details:hover,
  details[open] {
    border-color: var(--ds-border-strong);
    box-shadow: none;
  }

  summary {
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
    padding: var(--ds-space-4) var(--ds-space-5);
    border-radius: var(--ds-radius-md);
    background: transparent;
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-text);
    list-style: none;
    cursor: pointer;
    user-select: none;
    transition: background-color var(--ds-duration) var(--ds-ease);
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '+';
    flex-shrink: 0;
    width: var(--ds-icon-md);
    font-size: var(--ds-text-xl);
    font-weight: var(--ds-weight-regular);
    line-height: 1;
    text-align: center;
    color: var(--ds-accent);
    transition: transform var(--ds-duration) var(--ds-ease);
  }

  summary:hover,
  details[open] summary {
    background: var(--ds-surface-2);
    color: var(--ds-text);
  }

  details[open] summary {
    border-radius: var(--ds-radius-md) var(--ds-radius-md) 0 0;
  }

  details[open] summary::before {
    transform: rotate(45deg);
  }

  summary:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  details p {
    margin: 0;
    padding: var(--ds-space-4) var(--ds-space-5) var(--ds-space-5);
    border: 0;
    border-top: var(--ds-border-width) solid var(--ds-border);
    border-radius: 0;
    background: transparent;
    font-size: var(--ds-text-md);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
    animation: none;
  }

  details p :deep(strong) {
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  details p :deep(a) {
    color: var(--ds-link);
  }

  /* Abschluss */
  .cta-section {
    text-align: center;
  }

  .cta-content {
    padding: var(--ds-space-10) var(--ds-space-8);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
  }

  .cta-content h2 {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .cta-content p {
    margin: 0 0 var(--ds-space-6);
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  @media (max-width: 768px) {
    .faq-container {
      padding: var(--ds-space-10) var(--ds-space-4);
    }

    summary {
      padding: var(--ds-space-3) var(--ds-space-4);
      font-size: var(--ds-text-md);
    }

    details p {
      padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-4);
    }

    .cta-content {
      padding: var(--ds-space-8) var(--ds-space-5);
    }

    .cta-content h2 {
      font-size: var(--ds-text-xl);
    }
  }

  @media (max-width: 480px) {
    .faq-container {
      padding: var(--ds-space-6) var(--ds-space-3);
    }

    .content-header {
      margin-bottom: var(--ds-space-6);
    }

    .content-header h1 {
      font-size: var(--ds-text-2xl);
    }

    .content-header__subtitle {
      font-size: var(--ds-text-md);
    }

    .privacy-notice {
      margin-bottom: var(--ds-space-6);
    }

    .faq-questions {
      margin-bottom: var(--ds-space-8);
    }

    .faq-questions__title {
      margin-bottom: var(--ds-space-4);
      font-size: var(--ds-text-xl);
    }
  }
</style>
