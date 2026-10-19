<template>
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
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'

  const { t } = useTranslation()
</script>

<style scoped>
  /* Feature-Karten */

  .detail-item h3 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .detail-item p {
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

  /* Responsive */
  @media (max-width: 900px) {
    .details-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ds-space-6);
    }
  }

  @media (max-width: 600px) {
    .details-grid {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin-inline: auto;
    }

    .details-grid {
      gap: var(--ds-space-4);
    }

    .section-header {
      margin-bottom: var(--ds-space-8);
    }

    .section-header h2 {
      font-size: var(--ds-text-2xl);
    }

    .details-section {
      padding: var(--ds-space-12) var(--ds-space-4);
    }
  }
</style>
