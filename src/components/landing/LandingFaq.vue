<template>
  <section id="faq" class="faq">
    <div class="container">
      <h2 class="section-title">{{ t('faq_page_title') }}</h2>
      <div class="faq-list">
        <div
          v-for="(key, index) in QUESTION_KEYS"
          :key="key"
          class="faq-item"
          :class="{ 'faq-open': open.has(key) }"
        >
          <button
            :id="`landing-faq-q${index}`"
            type="button"
            class="faq-question"
            :aria-expanded="open.has(key)"
            :aria-controls="`landing-faq-a${index}`"
            @click="toggle(key)"
          >
            <span>{{ t(`${key}_title`) }}</span>
            <span class="faq-icon" aria-hidden="true">{{ open.has(key) ? '−' : '+' }}</span>
          </button>
          <div
            v-show="open.has(key)"
            :id="`landing-faq-a${index}`"
            class="faq-answer"
            role="region"
            :aria-labelledby="`landing-faq-q${index}`"
          >
            <!-- Texte stammen aus src/i18n (eigene Quelle), wie auf der FAQ-Seite -->
            <p v-html="t(`${key}_text`)"></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useTranslation } from '../../composables/useTranslation'

  const { t } = useTranslation()

  /** Auswahl der sechs wichtigsten Fragen; alle neun stehen auf der FAQ-Seite. */
  const QUESTION_KEYS = ['faq_q1', 'faq_q2', 'faq_q3', 'faq_q6', 'faq_q7', 'faq_q8'] as const
  type QuestionKey = (typeof QUESTION_KEYS)[number]

  const open = ref(new Set<QuestionKey>())

  function toggle(key: QuestionKey): void {
    const next = new Set(open.value)
    if (!next.delete(key)) next.add(key)
    open.value = next
  }
</script>
