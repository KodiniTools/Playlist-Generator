<template>
  <nav class="app-nav" :class="{ 'nav-scrolled': isScrolled }">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🎵</span>
        <span class="logo-text">Playlist Generator</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          {{ t('nav_home') }}
        </router-link>
        <router-link to="/app" class="nav-link" :class="{ active: $route.path === '/app' }">
          {{ t('nav_app') }}
        </router-link>
        <router-link to="/faq" class="nav-link" :class="{ active: $route.path === '/faq' }">
          {{ t('nav_faq') }}
        </router-link>
        <router-link to="/blog" class="nav-link" :class="{ active: $route.path === '/blog' }">
          {{ t('nav_blog') }}
        </router-link>
      </div>

      <div class="nav-controls">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
        <span class="hamburger" :class="{ open: mobileMenuOpen }"></span>
      </button>
    </div>

    <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
      <router-link to="/" class="mobile-link" @click="mobileMenuOpen = false">
        {{ t('nav_home') }}
      </router-link>
      <router-link to="/app" class="mobile-link" @click="mobileMenuOpen = false">
        {{ t('nav_app') }}
      </router-link>
      <router-link to="/faq" class="mobile-link" @click="mobileMenuOpen = false">
        {{ t('nav_faq') }}
      </router-link>
      <router-link to="/blog" class="mobile-link" @click="mobileMenuOpen = false">
        {{ t('nav_blog') }}
      </router-link>
      <div class="mobile-controls">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useTranslation } from '../composables/useTranslation'

const { t } = useTranslation()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const EXTERNAL_NAV_HEIGHT = 50

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > EXTERNAL_NAV_HEIGHT
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-nav {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 900;
  background: linear-gradient(135deg, rgba(12, 12, 16, 0.95), rgba(22, 22, 28, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  transition: top 0.3s ease;
}

.app-nav.nav-scrolled {
  top: 0;
}

.light-theme .app-nav {
  background: linear-gradient(135deg, rgba(245, 245, 245, 0.95), rgba(232, 232, 232, 0.95));
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.nav-logo:hover {
  color: var(--accent-color);
}

.logo-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: var(--muted-color);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--accent-color);
  background: rgba(242, 226, 142, 0.1);
}

.light-theme .nav-link:hover,
.light-theme .nav-link.active {
  background: rgba(162, 134, 128, 0.1);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-color);
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: var(--text-color);
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  top: 8px;
}

.hamburger.open {
  background: transparent;
}

.hamburger.open::before {
  top: 0;
  transform: rotate(45deg);
}

.hamburger.open::after {
  top: 0;
  transform: rotate(-45deg);
}

.mobile-menu {
  display: none;
  padding: 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.mobile-link {
  display: block;
  padding: 15px;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-link:hover {
  background: rgba(242, 226, 142, 0.1);
  color: var(--accent-color);
}

.mobile-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .nav-links,
  .nav-controls {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu.open {
    display: block;
  }
}
</style>
