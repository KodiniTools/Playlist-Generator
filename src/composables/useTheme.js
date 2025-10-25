import { ref, watch } from 'vue'

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
    if (newTheme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, { immediate: true })

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    isLight: () => currentTheme.value === 'light'
  }
}
