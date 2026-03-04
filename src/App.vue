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

// Initialize theme – reacts to theme-changed CustomEvent from SSI nav
useTheme()

// Initialize translation – reacts to language-changed CustomEvent from SSI nav
const {
  currentLanguage,
  setLanguage,
  translateExternalNav,
  dispatchLanguageChanged,
  syncExternalLangButtons,
  interceptExternalLangSwitcher
} = useTranslation()

// --- External Nav Height Measurement (ResizeObserver) ---
let externalNavResizeObserver = null

function updateExternalNavHeight() {
  const wrapper = document.querySelector('.external-nav-wrapper')
  if (!wrapper) return

  const navEl = wrapper.querySelector('nav, header') || wrapper
  const height = navEl.getBoundingClientRect().height
  document.documentElement.style.setProperty('--external-nav-height', `${height}px`)

  // Observe size changes dynamically
  if (externalNavResizeObserver) externalNavResizeObserver.disconnect()
  externalNavResizeObserver = new ResizeObserver(entries => {
    const h = entries[0].contentRect.height
    document.documentElement.style.setProperty('--external-nav-height', `${h}px`)
  })
  externalNavResizeObserver.observe(navEl)
}

// --- MutationObserver for dynamically loaded SSI partials ---
let domMutationObserver = null

function initMutationObserver() {
  domMutationObserver = new MutationObserver((mutations) => {
    const hasNewElements = mutations.some(m =>
      m.type === 'childList' && m.addedNodes.length > 0 &&
      Array.from(m.addedNodes).some(n => n.nodeType === Node.ELEMENT_NODE)
    )
    if (!hasNewElements) return

    // Pause observer to prevent infinite loop (translateExternalNav mutates DOM)
    domMutationObserver.disconnect()

    const locale = currentLanguage.value
    updateExternalNavHeight()
    interceptExternalLangSwitcher(setLanguage)
    syncExternalLangButtons(locale)
    translateExternalNav(locale)
    dispatchLanguageChanged(locale)

    // Re-enable observer after DOM settles
    requestAnimationFrame(() => {
      if (domMutationObserver) {
        domMutationObserver.observe(document.body, { childList: true, subtree: true })
      }
    })
  })
  domMutationObserver.observe(document.body, { childList: true, subtree: true })
}

// --- Lifecycle ---
onMounted(() => {
  const locale = currentLanguage.value
  document.documentElement.lang = locale

  // Sync language from global nav's 'locale' key (in case it was changed
  // by the global nav before Vue mounted)
  const globalNavLang = localStorage.getItem('locale')
  if (globalNavLang && globalNavLang !== locale) {
    setLanguage(globalNavLang)
  }

  // Initialize all SSI-Partial synchronisation
  updateExternalNavHeight()
  interceptExternalLangSwitcher(setLanguage)
  syncExternalLangButtons(locale)
  translateExternalNav(locale)
  dispatchLanguageChanged(locale)

  // Start watching for dynamically loaded partials
  initMutationObserver()
})

onUnmounted(() => {
  if (externalNavResizeObserver) {
    externalNavResizeObserver.disconnect()
    externalNavResizeObserver = null
  }
  if (domMutationObserver) {
    domMutationObserver.disconnect()
    domMutationObserver = null
  }
})
</script>

<style>
.app-wrapper {
  min-height: 100vh;
}
</style>
