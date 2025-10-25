<template>
  <section class="tools-grid-section">
    <h2 class="section-title">{{ t('more_tools_title') }}</h2>
    <div class="tools-grid">
      <!-- Card 1: Music Player -->
      <div class="tool-card">
        <div class="card-icon">🎵</div>
        <h3>{{ t('tool1_title') }}</h3>
        <p>{{ t('tool1_desc') }}</p>
        <a href="https://kodinitools.com/ultimativermusikplayer/" target="_blank" class="card-button">
          {{ t('tool_button') }}
        </a>
      </div>
      
      <!-- Card 2: Equalizer -->
      <div class="tool-card">
        <div class="card-icon">🎚️</div>
        <h3>{{ t('tool2_title') }}</h3>
        <p>{{ t('tool2_desc') }}</p>
        <a href="https://kodinitools.com/equaliser19/" target="_blank" class="card-button">
          {{ t('tool_button') }}
        </a>
      </div>
      
      <!-- Card 3: Audio Converter -->
      <div class="tool-card">
        <div class="card-icon">🔄</div>
        <h3>{{ t('tool3_title') }}</h3>
        <p>{{ t('tool3_desc') }}</p>
        <a href="https://kodinitools.com/audiokonverter/" target="_blank" class="card-button">
          {{ t('tool_button') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useTranslation } from '../composables/useTranslation'

const { t } = useTranslation()
</script>
