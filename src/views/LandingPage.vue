<template>
  <div class="landing-page">
    <AppHeader />

    <!-- Hero Section -->
    <LandingHero />

    <!-- Feature Cards Grid -->
    <LandingFeatureCards />

    <!-- Features Details Section -->
    <LandingDetails />

    <!-- KodiniTools Section -->
    <LandingTools />

    <!-- Final CTA Section -->
    <LandingCta />
  </div>
</template>

<script setup lang="ts">
  import AppHeader from '../components/AppHeader.vue'
  import LandingCta from '../components/landing/LandingCta.vue'
  import LandingDetails from '../components/landing/LandingDetails.vue'
  import LandingFeatureCards from '../components/landing/LandingFeatureCards.vue'
  import LandingHero from '../components/landing/LandingHero.vue'
  import LandingTools from '../components/landing/LandingTools.vue'
</script>

<style scoped>
  .landing-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }
</style>
