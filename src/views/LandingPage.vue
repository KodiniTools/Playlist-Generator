<template>
  <div class="landing-page">
    <AppHeader />

    <!-- Aufbau und Maße nach dem Vorbild Audio Normalizer; Styles: assets/kodini-landing-modern.css -->
    <LandingHero />
    <LandingDetails />
    <LandingFeatureCards />
    <LandingFaq />
    <LandingTools />
  </div>
</template>

<script setup lang="ts">
  import AppHeader from '../components/AppHeader.vue'
  import LandingDetails from '../components/landing/LandingDetails.vue'
  import LandingFaq from '../components/landing/LandingFaq.vue'
  import LandingFeatureCards from '../components/landing/LandingFeatureCards.vue'
  import LandingHero from '../components/landing/LandingHero.vue'
  import LandingTools from '../components/landing/LandingTools.vue'
</script>
