import { ref, watch, onUnmounted } from 'vue'

const currentTheme = ref(localStorage.getItem('theme') || 'dark')

export function useTheme() {
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
  }

  // Watch for theme changes and apply to document
  watch(currentTheme, (newTheme) => {
    localStorage.setItem('theme', newTheme)

    // Apply .light-theme class on body (for Vue app CSS variables)
    if (newTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }

    // Apply data-theme attribute on <html> (for global nav SSI include CSS)
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

  onUnmounted(() => {
    window.removeEventListener('theme-changed', handleGlobalThemeChange)
  })

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    isLight: () => currentTheme.value === 'light'
  }
}
