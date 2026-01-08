<template>
  <div class="app-wrapper">
    <AppNavigation />
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppNavigation from './components/AppNavigation.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { useTranslation } from './composables/useTranslation'

// Initialize theme (the watch with immediate: true handles DOM updates)
useTheme()

// Set document language
const { currentLanguage } = useTranslation()

onMounted(() => {
  document.documentElement.lang = currentLanguage.value
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
}
</style>
