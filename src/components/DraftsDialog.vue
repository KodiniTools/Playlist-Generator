<template>
  <UiDialog
    :open="open"
    :title="t('drafts_title')"
    :description="t('drafts_description')"
    :close-label="t('toast_close')"
    @close="emit('close')"
  >
    <div class="tw:flex tw:flex-col tw:gap-4">
      <UiButton
        variant="primary"
        :disabled="files.length === 0"
        data-action="draft-save"
        @click="handleSave"
      >
        {{ fill('drafts_save_current') }}
      </UiButton>

      <p v-if="drafts.length === 0" class="tw:m-0 tw:text-sm tw:text-text-3">
        {{ t('drafts_empty') }}
      </p>
      <ul
        v-else
        class="tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-2 tw:p-0"
        :aria-label="t('drafts_list_label')"
      >
        <li
          v-for="draft in drafts"
          :key="draft.id"
          class="tw:flex tw:flex-wrap tw:items-center tw:gap-3 tw:rounded-md tw:border tw:border-border tw:bg-surface-1 tw:px-3 tw:py-2"
        >
          <div class="tw:flex tw:min-w-0 tw:flex-1 tw:flex-col">
            <span class="tw:truncate tw:font-medium tw:text-text">{{ draft.name }}</span>
            <span class="tw:text-sm tw:text-text-3">
              {{ fill('drafts_tracks', { count: draft.trackCount }) }} ·
              {{ dateFormat.format(draft.savedAt) }}
            </span>
          </div>
          <div class="tw:flex tw:gap-2">
            <UiButton
              size="sm"
              :aria-label="`${t('drafts_load')}: ${draft.name}`"
              @click="handleLoad(draft)"
            >
              {{ t('drafts_load') }}
            </UiButton>
            <UiButton
              size="sm"
              variant="ghost"
              :aria-label="`${confirmId === draft.id ? t('drafts_delete_confirm') : t('drafts_delete')}: ${draft.name}`"
              @click="handleDelete(draft)"
            >
              {{ confirmId === draft.id ? t('drafts_delete_confirm') : t('drafts_delete') }}
            </UiButton>
          </div>
        </li>
      </ul>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { UiButton, UiDialog } from './ui'
  import { usePlaylist } from '../composables/usePlaylist'
  import { useToast } from '../composables/useToast'
  import { useTranslation, type TranslationKey } from '../composables/useTranslation'
  import {
    deleteDraft,
    listDrafts,
    loadDraft,
    saveDraft,
    type DraftSummary,
  } from '../utils/draftRepository'

  /** Entwürfe verwalten: aktuellen Stand speichern, laden, löschen. */
  const props = defineProps<{ open: boolean }>()
  const emit = defineEmits<{ close: [] }>()

  const { t, currentLanguage } = useTranslation()
  const { files, playlistName, draftSnapshot, loadDraftState } = usePlaylist()
  const toast = useToast()

  const drafts = ref<DraftSummary[]>([])
  const busy = ref(false)
  // Löschen braucht einen zweiten Klick; Entwürfe lassen sich nicht wiederherstellen.
  const confirmId = ref<number | null>(null)

  const dateFormat = computed(
    () =>
      new Intl.DateTimeFormat(currentLanguage.value === 'de' ? 'de-DE' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
  )

  const fill = (key: TranslationKey, values: Record<string, string | number> = {}) =>
    Object.entries({ name: playlistName.value, ...values }).reduce(
      (text, [k, v]) => text.replace(`{${k}}`, String(v)),
      t.value(key),
    )

  async function refresh() {
    try {
      drafts.value = await listDrafts()
    } catch (err) {
      console.warn('Could not list drafts:', err)
      drafts.value = []
    }
  }

  watch(
    () => props.open,
    (open) => {
      confirmId.value = null
      if (open) void refresh()
    },
    { immediate: true },
  )

  // Nicht über `disabled`: ein deaktivierter Button verliert den Fokus, und Escape
  // erreicht den Dialog dann nicht mehr.
  async function run(action: () => Promise<void>) {
    if (busy.value) return
    busy.value = true
    try {
      await action()
    } catch (err) {
      console.warn('Draft action failed:', err)
      toast.error(t.value('toast_draft_error'))
    } finally {
      busy.value = false
    }
  }

  const handleSave = () =>
    run(async () => {
      const { meta, files: list } = draftSnapshot()
      await saveDraft(meta.playlistName, meta, list)
      toast.success(fill('toast_draft_saved'))
      await refresh()
    })

  const handleLoad = (draft: DraftSummary) =>
    run(async () => {
      const loaded = await loadDraft(draft.id)
      if (!loaded) {
        await refresh()
        throw new Error(`Draft ${draft.id} not found`)
      }
      loadDraftState(loaded)
      toast.success(fill('toast_draft_loaded', { name: draft.name }))
      emit('close')
    })

  const handleDelete = (draft: DraftSummary) => {
    if (confirmId.value !== draft.id) {
      confirmId.value = draft.id
      return
    }
    void run(async () => {
      await deleteDraft(draft.id)
      confirmId.value = null
      await refresh()
    })
  }
</script>
