<template>
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
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'

  const { t } = useTranslation()
</script>

<style scoped>
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

  .feature-card__icon {
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

  .feature-card__icon svg {
    width: var(--ds-space-6);
    height: var(--ds-space-6);
  }

  .feature-card h3 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .feature-card p {
    margin: 0;
    font-size: var(--ds-text-md);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .feature-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-width: 720px;
    }
  }

  @media (max-width: 600px) {
    .feature-cards {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin-inline: auto;
    }

    .feature-cards-wrapper {
      padding: 0 var(--ds-space-4) var(--ds-space-12);
    }
  }

  @media (max-width: 480px) {
    .feature-card {
      padding: var(--ds-space-6) var(--ds-space-4);
    }
  }
</style>
