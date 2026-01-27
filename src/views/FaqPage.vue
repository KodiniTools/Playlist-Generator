<template>
  <div class="faq-page">
    <main class="container">
      <!-- Header -->
      <header class="page-header">
        <h1>{{ t('faq_page_title') }}</h1>
        <p class="subtitle">{{ t('faq_page_subtitle') }}</p>
      </header>

      <!-- Privacy Notice -->
      <section class="privacy-notice">
        <div class="privacy-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="privacy-content">
          <h3>{{ t('privacy_title') }}</h3>
          <p>{{ t('privacy_text') }}</p>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="section-title">{{ t('faq_title') }}</h2>

        <div class="faq-list">
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

          <details>
            <summary>{{ t('faq_q6_title') }}</summary>
            <p v-html="t('faq_q6_text')"></p>
          </details>

          <details>
            <summary>{{ t('faq_q7_title') }}</summary>
            <p v-html="t('faq_q7_text')"></p>
          </details>

          <details>
            <summary>{{ t('faq_q8_title') }}</summary>
            <p v-html="t('faq_q8_text')"></p>
          </details>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>{{ t('cta_title') }}</h2>
          <p>{{ t('cta_desc') }}</p>
          <router-link to="/app" class="btn btn-primary btn-large">
            {{ t('cta_button') }}
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useTranslation } from '../composables/useTranslation'

const { t } = useTranslation()
</script>

<style scoped>
.faq-page {
  padding-top: 120px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  animation: fade-in 0.8s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  animation: slide-in 0.8s ease-out;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
}

.page-header .subtitle {
  font-size: 1.1rem;
  color: var(--muted-color);
}

/* Privacy Notice */
.privacy-notice {
  display: flex;
  gap: 20px;
  background: linear-gradient(135deg,
    rgba(125, 216, 125, 0.1),
    rgba(125, 216, 125, 0.05));
  border: 2px solid var(--success-color);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 50px;
  animation: slide-in 0.8s ease-out 0.2s both;
}

.light-theme .privacy-notice {
  background: linear-gradient(135deg,
    rgba(76, 175, 80, 0.1),
    rgba(76, 175, 80, 0.05));
}

.privacy-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  color: var(--success-color);
}

.privacy-icon svg {
  width: 100%;
  height: 100%;
}

.privacy-content h3 {
  font-size: 1.2rem;
  color: var(--success-color);
  margin-bottom: 10px;
}

.privacy-content p {
  font-size: 0.95rem;
  color: var(--text-color);
  line-height: 1.7;
  margin: 0;
}

/* FAQ Section */
.faq-section {
  margin-bottom: 60px;
  animation: slide-in 0.8s ease-out 0.3s both;
}

.section-title {
  font-size: 1.8rem;
  color: var(--accent-color);
  margin-bottom: 30px;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

details {
  background: linear-gradient(135deg,
    rgba(22, 22, 28, 0.8),
    rgba(22, 22, 28, 0.6));
  border: 1px solid var(--border-color);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.light-theme details {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8));
}

details:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 20px var(--shadow-color);
}

summary {
  background: var(--btn-color);
  padding: 20px 25px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-color);
  transition: all 0.3s ease;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 15px;
}

summary::before {
  content: '+';
  font-size: 1.3rem;
  font-weight: 400;
  color: var(--accent-color);
  transition: transform 0.3s ease;
}

details[open] summary::before {
  transform: rotate(45deg);
}

summary::-webkit-details-marker {
  display: none;
}

summary:hover {
  background: var(--accent-color);
  color: var(--accent-text-color);
}

summary:hover::before {
  color: var(--accent-text-color);
}

details[open] summary {
  background: var(--accent-color);
  color: var(--accent-text-color);
}

details[open] summary::before {
  color: var(--accent-text-color);
}

details p {
  margin: 0;
  color: var(--muted-color);
  padding: 25px;
  background: linear-gradient(135deg, rgba(22, 22, 28, 0.3), rgba(22, 22, 28, 0.1));
  border-left: 3px solid var(--accent-color);
  line-height: 1.7;
  animation: slide-down 0.3s ease-out;
}

.light-theme details p {
  background: linear-gradient(135deg, rgba(232, 232, 232, 0.5), rgba(232, 232, 232, 0.3));
}

/* CTA Section */
.cta-section {
  animation: slide-in 0.8s ease-out 0.4s both;
}

.cta-content {
  text-align: center;
  background: linear-gradient(135deg,
    rgba(22, 22, 28, 0.8),
    rgba(22, 22, 28, 0.6));
  border: 1px solid var(--border-color);
  border-radius: 25px;
  padding: 50px 40px;
  backdrop-filter: blur(15px);
}

.light-theme .cta-content {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8));
}

.cta-content h2 {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 15px;
}

.cta-content p {
  font-size: 1rem;
  color: var(--muted-color);
  margin-bottom: 25px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 35px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
  color: var(--accent-text-color);
  box-shadow: 0 4px 20px var(--shadow-color);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--shadow-color), 0 0 20px var(--glow-color);
}

.btn-large {
  padding: 18px 45px;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 40px 15px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .privacy-notice {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .privacy-icon {
    margin: 0 auto;
  }

  summary {
    padding: 15px 20px;
  }

  details p {
    padding: 20px;
  }

  .cta-content {
    padding: 35px 25px;
  }

  .cta-content h2 {
    font-size: 1.4rem;
  }
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
