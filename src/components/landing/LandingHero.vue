<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">{{ t('hero_title') }}</h1>
        <p class="hero-subtitle">{{ t('hero_subtitle') }}</p>
        <p class="hero-description">{{ t('hero_description') }}</p>
        <RouterLink to="/app" class="btn-hero">{{ t('hero_cta') }} →</RouterLink>
      </div>
      <figure class="hero-media">
        <img
          :key="heroImageSrc"
          :src="heroImageSrc"
          :alt="t('hero_image_alt')"
          :width="LANDING_IMAGE_WIDTH"
          :height="LANDING_IMAGE_HEIGHT"
          class="hero-image"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useTranslation } from '../../composables/useTranslation'
  import {
    LANDING_IMAGE_HEIGHT,
    LANDING_IMAGE_WIDTH,
    landingImageSrc,
  } from '../../utils/landingImage'

  const { t, currentLanguage } = useTranslation()

  /** Hero-Bild folgt der UI-Sprache (DE/EN). */
  const heroImageSrc = computed(() =>
    landingImageSrc(currentLanguage.value, import.meta.env.BASE_URL),
  )
</script>
