<template>
  <section id="features" class="features">
    <div class="container">
      <h2 class="section-title">{{ t('details_title') }}</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>{{ t('detail1_title') }}</h3>
          <p>{{ t('detail1_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <h3>{{ t('detail2_title') }}</h3>
          <p>{{ t('detail2_desc') }}</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
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

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
              />
            </svg>
          </div>
          <h3>{{ t('detail6_title') }}</h3>
          <p>{{ t('detail6_desc') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'

  const { t } = useTranslation()
</script>
