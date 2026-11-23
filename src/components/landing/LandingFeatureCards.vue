<template>
  <section class="benefits">
    <div class="container">
      <h2 class="section-title">{{ t('benefits_title') }}</h2>
      <div class="benefits-grid">
        <div v-for="benefit in benefits" :key="benefit.titleKey" class="benefit-card">
          <h3>{{ t(benefit.titleKey) }}</h3>
          <p>{{ t(benefit.descKey) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useTranslation, type TranslationKey } from '../../composables/useTranslation'

  const { t } = useTranslation()

  const benefits: ReadonlyArray<{ titleKey: TranslationKey; descKey: TranslationKey }> = [
    { titleKey: 'feature1_title', descKey: 'feature1_desc' },
    { titleKey: 'feature2_title', descKey: 'feature2_desc' },
    { titleKey: 'feature3_title', descKey: 'feature3_desc' },
  ]
</script>
