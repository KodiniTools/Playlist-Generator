<template>
  <section
    class="tw:px-gutter tw:pb-16 tw:text-center tw:[@media(max-width:600px)]:px-4 tw:[@media(max-width:600px)]:pb-12"
  >
    <div
      class="tw:mx-auto tw:max-w-[640px] tw:rounded-lg tw:border tw:border-border tw:bg-surface-1 tw:px-10 tw:py-12 tw:[@media(max-width:600px)]:px-6 tw:[@media(max-width:600px)]:py-8"
    >
      <h2
        class="tw:mb-3 tw:text-2xl tw:leading-tight tw:font-bold tw:text-text tw:[@media(max-width:600px)]:text-xl"
      >
        {{ t('cta_title') }}
      </h2>
      <p class="tw:mb-6 tw:text-lg tw:leading-normal tw:text-text-2">{{ t('cta_desc') }}</p>
      <UiButton to="/app" variant="primary" size="lg">{{ t('cta_button') }}</UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/useTranslation'
  import { UiButton } from '../ui'

  const { t } = useTranslation()
</script>
