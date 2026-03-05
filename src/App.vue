<template>
  <div class="app-wrapper">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import { useTheme } from './composables/useTheme'
import { useTranslation } from './composables/useTranslation'

// Initialize theme – reacts to theme-changed CustomEvent from SSI nav
useTheme()

// Initialize translation (pure data, no side-effects)
const {
  currentLanguage,
  setLanguage,
  translateExternalNav,
  dispatchLanguageChanged,
  syncExternalLangButtons,
  interceptExternalLangSwitcher
} = useTranslation()

// =====================================================================
// SSI-Partial Synchronisation (SINGLETON – only here, never in children)
// =====================================================================

// --- Watch: sync ALL external SSI elements on every language change ---
// { immediate: true } ensures the initial sync runs during setup.
// This watch exists ONLY in App.vue to prevent duplicate events when
// multiple components (LanguageSwitcher etc.) also call useTranslation().
watch(currentLanguage, (newLocale) => {
  document.documentElement.setAttribute('lang', newLocale)

  // Sync SSI-Partial lang buttons active state
  syncExternalLangButtons(newLocale)

  // Translate SSI nav elements (data-nav-i18n attributes)
  translateExternalNav(newLocale)

  // Translate SSI footer/cookie-banner (data-lang-* attributes) + dispatch event
  dispatchLanguageChanged(newLocale)
}, { immediate: true })

// --- Listen for language-changed events from the global navigation (SSI include) ---
function handleGlobalLanguageChange(e) {
  const newLang = e.detail?.lang
  if (newLang && newLang !== currentLanguage.value) {
    setLanguage(newLang)
  }
}
window.addEventListener('language-changed', handleGlobalLanguageChange)

// --- MutationObserver on <html> lang attribute (fallback for direct SSI changes) ---
const htmlLangObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.attributeName === 'lang') {
      const newLang = document.documentElement.getAttribute('lang')
      if (newLang && newLang !== currentLanguage.value) {
        setLanguage(newLang)
      }
    }
  }
})
htmlLangObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
})

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
  // Sync language from global nav's 'locale' key (in case it was changed
  // by the global nav before Vue mounted)
  const globalNavLang = localStorage.getItem('locale')
  if (globalNavLang && globalNavLang !== currentLanguage.value) {
    setLanguage(globalNavLang)
  }

  // Initialize SSI-Partial interactions that require DOM elements
  updateExternalNavHeight()
  interceptExternalLangSwitcher(setLanguage)

  // Start watching for dynamically loaded partials
  initMutationObserver()
})

onUnmounted(() => {
  window.removeEventListener('language-changed', handleGlobalLanguageChange)
  htmlLangObserver.disconnect()
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
