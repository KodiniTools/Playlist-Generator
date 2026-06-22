<template>
  <Transition name="onboarding">
    <div v-if="visible" class="onboarding-banner" role="region" :aria-label="t('onboarding_aria')">
      <ol class="steps" aria-label="Workflow">
        <li v-for="(step, i) in steps" :key="i" class="step">
          <span class="step-number" aria-hidden="true">{{ i + 1 }}</span>
          <span class="step-icon" aria-hidden="true">{{ step.icon }}</span>
          <span class="step-label">{{ t(step.labelKey) }}</span>
          <span v-if="i < steps.length - 1" class="step-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </li>
      </ol>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTranslation } from '../composables/useTranslation'

  const props = defineProps<{ hasFiles: boolean }>()
  const { t } = useTranslation()

  const visible = computed(() => !props.hasFiles)

  const steps = [
    { icon: '🎵', labelKey: 'onboarding_step1' },
    { icon: '↕️', labelKey: 'onboarding_step2' },
    { icon: '💾', labelKey: 'onboarding_step3' },
  ]
</script>

<style scoped>
  .onboarding-banner {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    animation: slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .steps {
    list-style: none;
    margin: 0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 0;
    background: linear-gradient(135deg, rgba(22, 22, 28, 0.8), rgba(22, 22, 28, 0.5));
    border: 1px solid var(--border-color);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 12px;
  }

  .light-theme .steps {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.8));
  }

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary));
    color: var(--accent-text-color);
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .step-label {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
  }

  .step-arrow {
    display: flex;
    align-items: center;
    color: var(--muted-color);
    opacity: 0.5;
    margin: 0 8px;
  }

  /* Leave animation */
  .onboarding-enter-active {
    transition:
      opacity 0.5s ease,
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      max-height 0.5s ease;
  }
  .onboarding-leave-active {
    transition:
      opacity 0.35s ease,
      transform 0.35s ease,
      max-height 0.4s ease,
      margin-bottom 0.4s ease;
    overflow: hidden;
  }
  .onboarding-enter-from {
    opacity: 0;
    transform: translateY(-12px);
  }
  .onboarding-leave-to {
    opacity: 0;
    transform: translateY(-8px);
    max-height: 0 !important;
    margin-bottom: 0 !important;
  }

  @keyframes slide-in {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 540px) {
    .steps {
      padding: 12px 16px;
      gap: 0;
      row-gap: 10px;
    }

    .step-label {
      font-size: 0.82rem;
    }

    .step-arrow {
      margin: 0 4px;
    }
  }
</style>
