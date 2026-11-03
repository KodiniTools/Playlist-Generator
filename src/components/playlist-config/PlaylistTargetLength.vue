<template>
  <form class="tw:flex tw:flex-col tw:gap-2" novalidate @submit.prevent="onSubmit">
    <div class="tw:flex tw:flex-wrap tw:items-end tw:gap-4">
      <UiTextField
        class="tw:w-40"
        :model-value="targetMinutes"
        :label="t('label_target_length')"
        inputmode="numeric"
        autocomplete="off"
        :aria-invalid="targetError ? 'true' : undefined"
        aria-describedby="target-length-note"
        @update:model-value="onInput"
      />
      <div class="tw:flex tw:flex-col tw:gap-1">
        <span class="tw:text-sm tw:font-medium tw:text-text-2" aria-hidden="true">
          {{ t('label_target_mode') }}
        </span>
        <UiSegmentedControl
          v-model="targetMode"
          :options="targetModes"
          :label="t('label_target_mode')"
          size="sm"
        />
      </div>
      <UiButton type="submit" variant="secondary">{{ t('button_fit_target') }}</UiButton>
    </div>
    <p
      id="target-length-note"
      :class="['tw:m-0 tw:text-sm', targetError ? 'tw:text-danger' : 'tw:text-text-3']"
      :role="targetError ? 'alert' : undefined"
    >
      {{ targetError ? t(targetError) : t('hint_target_length') }}
    </p>
  </form>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { UiButton, UiSegmentedControl, UiTextField } from '../ui'
  import type { SegmentedOption } from '../ui'
  import { usePlaylist, type FillMode } from '../../composables/usePlaylist'
  import { useTranslation } from '../../composables/useTranslation'

  /**
   * Ziel-Länge: setzt die Häkchen so, dass die Auswahl höchstens die
   * eingegebene Minutenzahl (1–1440) lang ist, der Reihe nach oder zufällig.
   */
  const { t } = useTranslation()
  const { fitToLength } = usePlaylist()

  const targetMinutes = ref('60')
  const targetMode = ref<FillMode>('order')
  const targetError = ref<'error_target_length' | 'error_target_none' | null>(null)

  const targetModes = computed<SegmentedOption[]>(() => [
    { value: 'order', label: t.value('target_mode_order') },
    { value: 'random', label: t.value('target_mode_random') },
  ])

  function onInput(value: string) {
    targetMinutes.value = value
    targetError.value = null
  }

  function onSubmit() {
    const text = targetMinutes.value.trim()
    const minutes = /^\d+$/.test(text) ? Number(text) : NaN
    if (!(minutes >= 1 && minutes <= 1440)) {
      targetError.value = 'error_target_length'
      return
    }
    targetError.value = fitToLength(minutes * 60, targetMode.value) > 0 ? null : 'error_target_none'
  }
</script>
