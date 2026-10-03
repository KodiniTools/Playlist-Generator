<template>
  <section class="tools" :aria-labelledby="titleId">
    <h2 :id="titleId" class="tools__title">{{ t('more_tools_title') }}</h2>
    <div class="tools__grid">
      <article v-for="tool in tools" :key="tool.id" class="tools__card">
        <span class="tools__icon" aria-hidden="true">
          <svg
            v-if="tool.id === 'player'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <svg
            v-else-if="tool.id === 'equalizer'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
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
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </span>
        <h3 class="tools__card-title">{{ t(tool.titleKey) }}</h3>
        <p class="tools__card-text">{{ t(tool.descKey) }}</p>
        <UiButton
          class="tools__link"
          variant="secondary"
          :href="tool.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('tool_button') }}
        </UiButton>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useId } from 'vue'
  import { UiButton } from './ui'
  import { useTranslation } from '../composables/useTranslation'

  /** Verweise auf die anderen KodiniTools, flache Karten mit Linkbutton. */
  const { t } = useTranslation()
  const titleId = `tools-${useId()}`

  const tools: ReadonlyArray<{ id: string; titleKey: string; descKey: string; href: string }> = [
    {
      id: 'player',
      titleKey: 'tool1_title',
      descKey: 'tool1_desc',
      href: 'https://kodinitools.com/ultimativermusikplayer/',
    },
    {
      id: 'equalizer',
      titleKey: 'tool2_title',
      descKey: 'tool2_desc',
      href: 'https://kodinitools.com/equaliser19/',
    },
    {
      id: 'converter',
      titleKey: 'tool3_title',
      descKey: 'tool3_desc',
      href: 'https://kodinitools.com/audiokonverter/',
    },
  ]
</script>

<style scoped>
  .tools {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-4);
  }

  .tools__title {
    margin: 0;
    font-size: var(--ds-text-xl);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .tools__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--ds-gap);
  }

  .tools__card {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-2);
    padding: var(--ds-space-5);
    background: var(--ds-surface-1);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
  }

  .tools__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ds-control-lg);
    height: var(--ds-control-lg);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-2);
    color: var(--ds-accent);
    margin-bottom: var(--ds-space-1);
  }

  .tools__icon svg {
    width: var(--ds-icon-md);
    height: var(--ds-icon-md);
  }

  .tools__card-title {
    margin: 0;
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  .tools__card-text {
    margin: 0;
    flex: 1;
    font-size: var(--ds-text-sm);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  .tools__link {
    align-self: flex-start;
    margin-top: var(--ds-space-2);
  }
</style>
