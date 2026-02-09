<template>
  <div class="app-wrapper">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { useTranslation } from './composables/useTranslation'

// Initialize theme – reacts to theme-changed CustomEvent from SSI nav
useTheme()

// Initialize translation – reacts to language-changed CustomEvent from SSI nav
const { currentLanguage, setLanguage } = useTranslation()

onMounted(() => {
  document.documentElement.lang = currentLanguage.value

  // Sync language from global nav's 'locale' key (in case it was changed
  // by the global nav before Vue mounted)
  const globalNavLang = localStorage.getItem('locale')
  if (globalNavLang && globalNavLang !== currentLanguage.value) {
    setLanguage(globalNavLang)
  }
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
}
</style>
