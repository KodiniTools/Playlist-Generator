<template>
  <section class="faq-section">
    <h2 class="section-title">{{ t('faq_title') }}</h2>
    <details>
      <summary>{{ t('faq_q1_title') }}</summary>
      <p v-html="t('faq_q1_text')"></p>
    </details>
    <details>
      <summary>{{ t('faq_q9_title') }}</summary>
      <p v-html="t('faq_q9_text')"></p>
    </details>
    <details>
      <summary>{{ t('faq_q2_title') }}</summary>
      <p v-html="t('faq_q2_text')"></p>
    </details>
    <details>
      <summary>{{ t('faq_q3_title') }}</summary>
      <p v-html="t('faq_q3_text')"></p>
    </details>
    <details>
      <summary>{{ t('faq_q4_title') }}</summary>
      <p v-html="t('faq_q4_text')"></p>
    </details>
    <details>
      <summary>{{ t('faq_q5_title') }}</summary>
      <p v-html="t('faq_q5_text')"></p>
    </details>
  </section>
</template>

<script setup>
import { useTranslation } from '../composables/useTranslation'

const { t } = useTranslation()
</script>
