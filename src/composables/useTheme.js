import { ref, watch, onUnmounted } from 'vue'

const currentTheme = ref(
  localStorage.getItem('theme') || localStorage.getItem('playlist-generator-theme') || 'dark'
)

export function useTheme() {
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
  }

  // Watch for theme changes and apply to document
  watch(currentTheme, (newTheme) => {
    // Dual-Key localStorage (global + app-specific)
    localStorage.setItem('theme', newTheme)
    localStorage.setItem('playlist-generator-theme', newTheme)

    // Apply .light-theme class on body (for Vue app CSS variables)
    if (newTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }

    // Apply data-theme attribute on <html> (for SSI partials CSS)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })

  // Listen for theme-changed events from the global navigation (SSI include)
  const handleGlobalThemeChange = (e) => {
    const newTheme = e.detail?.theme
    if (newTheme && newTheme !== currentTheme.value) {
      currentTheme.value = newTheme
    }
  }

  window.addEventListener('theme-changed', handleGlobalThemeChange)

  // MutationObserver on <html> to catch direct data-theme changes from SSI nav
  // This is the robust fallback: if the SSI nav changes data-theme directly
  // (without dispatching theme-changed event), we still detect and sync it.
  const htmlThemeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme')
        if (newTheme && newTheme !== currentTheme.value) {
          currentTheme.value = newTheme
        }
      }
    }
  })
  htmlThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })

  onUnmounted(() => {
    window.removeEventListener('theme-changed', handleGlobalThemeChange)
    htmlThemeObserver.disconnect()
  })

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    isLight: () => currentTheme.value === 'light'
  }
}
