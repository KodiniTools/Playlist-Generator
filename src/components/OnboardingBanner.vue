<template>
  <Transition name="onboarding">
    <div v-if="visible" class="onboarding" role="region" :aria-label="t('onboarding_aria')">
      <ol class="onboarding__steps">
        <li v-for="(step, index) in steps" :key="step.labelKey" class="onboarding__step">
          <span class="onboarding__number" aria-hidden="true">{{ index + 1 }}</span>
          <span class="onboarding__icon" aria-hidden="true">
            <svg
              v-if="step.icon === 'upload'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <svg
              v-else-if="step.icon === 'order'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="8 6 12 2 16 6" />
              <polyline points="16 18 12 22 8 18" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <span class="onboarding__label">{{ t(step.labelKey) }}</span>
          <svg
            v-if="index < steps.length - 1"
            class="onboarding__arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </li>
      </ol>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useTranslation } from '../composables/useTranslation'

  /** Dreischrittige Kurzanleitung, sichtbar bis die erste Datei in der Liste liegt. */
  const props = defineProps<{ hasFiles: boolean }>()
  const { t } = useTranslation()

  const visible = computed(() => !props.hasFiles)

  const steps: ReadonlyArray<{ icon: 'upload' | 'order' | 'save'; labelKey: string }> = [
    { icon: 'upload', labelKey: 'onboarding_step1' },
    { icon: 'order', labelKey: 'onboarding_step2' },
    { icon: 'save', labelKey: 'onboarding_step3' },
  ]
</script>

<style scoped>
  .onboarding {
    display: flex;
    justify-content: center;
  }

  .onboarding__steps {
    list-style: none;
    margin: 0;
    padding: var(--ds-space-3) var(--ds-space-5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    row-gap: var(--ds-space-2);
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
  }

  .onboarding__step {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
  }

  .onboarding__number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--ds-radius-full);
    background: var(--ds-accent);
    color: var(--ds-on-accent);
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-bold);
    flex-shrink: 0;
  }

  .onboarding__icon {
    display: inline-flex;
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    color: var(--ds-text-3);
  }

  .onboarding__icon svg {
    width: 100%;
    height: 100%;
  }

  .onboarding__label {
    font-size: var(--ds-text-sm);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-text);
    white-space: nowrap;
  }

  .onboarding__arrow {
    width: var(--ds-icon-sm);
    height: var(--ds-icon-sm);
    margin: 0 var(--ds-space-2);
    color: var(--ds-text-3);
  }

  .onboarding-enter-active,
  .onboarding-leave-active {
    transition:
      opacity var(--ds-duration-slow) var(--ds-ease),
      transform var(--ds-duration-slow) var(--ds-ease);
  }

  .onboarding-enter-from,
  .onboarding-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  @media (max-width: 540px) {
    .onboarding__steps {
      padding: var(--ds-space-3) var(--ds-space-4);
    }

    .onboarding__arrow {
      margin: 0 var(--ds-space-1);
    }
  }
</style>
