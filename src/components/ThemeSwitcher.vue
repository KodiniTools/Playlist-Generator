<template>
  <div class="theme-switcher">
    <button id="themeToggle" @click="toggleTheme">
      <span class="icon-sun">☀️</span>
      <span class="icon-moon">🌙</span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { useTheme } from '../composables/useTheme'

  const { toggleTheme } = useTheme()
</script>
