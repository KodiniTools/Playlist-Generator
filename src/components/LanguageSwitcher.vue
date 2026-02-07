<template>
  <div class="language-switcher">
    <button
      :class="{ active: currentLanguage === 'de' }"
      @click="setLanguage('de')"
    >
      DE
    </button>
    <button
      :class="{ active: currentLanguage === 'en' }"
      @click="setLanguage('en')"
    >
      EN
    </button>
  </div>
</template>

<script setup>
import { useTranslation } from '../composables/useTranslation'

const { currentLanguage, setLanguage } = useTranslation()
</script>
