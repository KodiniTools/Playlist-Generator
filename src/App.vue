<template>
  <div class="app-wrapper">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { useTranslation } from './composables/useTranslation'

// Initialize theme (the watch with immediate: true handles DOM updates)
// Also sets data-theme on <html> for global nav compatibility
useTheme()

// Set document language and sync with global nav's locale key
const { currentLanguage, setLanguage } = useTranslation()

// Intercept external SSI nav language buttons to prevent page reload.
// The external nav.html uses window.location.reload() on language switch,
// which destroys all in-memory state (uploaded files, player, etc.).
// We capture the click before the external handler runs and handle
// language switching reactively through Vue instead.
const interceptNavLangClick = (e) => {
  const btn = e.target.closest('.global-nav-lang-btn')
  if (!btn) return

  const targetLang = btn.getAttribute('data-lang')
  if (!targetLang) return

  // Stop the external nav's handler from firing (prevents reload)
  e.stopImmediatePropagation()
  e.preventDefault()

  // Skip if already on this language
  if (targetLang === currentLanguage.value) return

  // Switch language reactively via Vue
  setLanguage(targetLang)

  // Update the external nav's button active states to stay in sync
  document.querySelectorAll('.global-nav-lang-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-lang') === targetLang)
  })
}

onMounted(() => {
  document.documentElement.lang = currentLanguage.value

  // Sync language from global nav's 'locale' key (in case it was changed
  // by the global nav before Vue mounted)
  const globalNavLang = localStorage.getItem('locale')
  if (globalNavLang && globalNavLang !== currentLanguage.value) {
    setLanguage(globalNavLang)
  }

  // Register capturing listener so it fires BEFORE the external nav's handler
  document.addEventListener('click', interceptNavLangClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', interceptNavLangClick, true)
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
}
</style>
