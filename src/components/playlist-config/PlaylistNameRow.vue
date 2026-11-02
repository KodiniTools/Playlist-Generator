<template>
  <div class="tw:flex tw:flex-wrap tw:items-end tw:gap-3">
    <UiTextField
      id="playlistName"
      class="tw:min-w-0 tw:flex-1 tw:basis-64"
      :model-value="playlistName"
      :label="t('label_name')"
      :placeholder="t('placeholder_name')"
      autocomplete="off"
      @update:model-value="emit('update:playlistName', $event)"
    />
    <UiButton
      variant="secondary"
      aria-haspopup="dialog"
      data-action="drafts-open"
      @click="draftsOpen = true"
    >
      <template #icon>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </template>
      {{ t('button_drafts') }}
    </UiButton>
    <DraftsDialog :open="draftsOpen" @close="draftsOpen = false" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import DraftsDialog from '../DraftsDialog.vue'
  import { UiButton, UiTextField } from '../ui'
  import { useTranslation } from '../../composables/useTranslation'

  /** Name der Wiedergabeliste und Zugang zu den gespeicherten Entwürfen. */
  defineProps<{
    playlistName: string
  }>()

  const emit = defineEmits<{
    'update:playlistName': [value: string]
  }>()

  const { t } = useTranslation()
  const draftsOpen = ref(false)
</script>
