<template>
  <section class="output-section">
    <h2 class="section-title">{{ t('preview_title') }}</h2>
    <div class="form-group">
      <label for="outputFormat">{{ t('label_format') }}</label>
      <select id="outputFormat" v-model="localFormat" @change="handleFormatChange">
        <option value="m3u">{{ t('format_m3u') }}</option>
        <option value="xspf">{{ t('format_xspf') }}</option>
        <option value="json">{{ t('format_json') }}</option>
      </select>
    </div>
    <textarea
      id="output"
      class="output-area"
      readonly
      :placeholder="t('placeholder_output')"
      :value="playlistContent"
    ></textarea>
    <div class="button-row">
      <button
        type="button"
        class="copy-button"
        @click="handleCopy"
        :disabled="!playlistContent"
      >
        <span class="button-icon">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </span>
        {{ t('button_copy') }}
      </button>
      <button
        type="button"
        class="save-button"
        @click="handleSave"
      >
        <span class="button-icon">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke="currentColor" stroke-width="2"></path>
            <polyline points="17 21 17 13 7 13 7 21" fill="none" stroke="currentColor" stroke-width="2"></polyline>
            <polyline points="7 3 7 8 15 8" fill="none" stroke="currentColor" stroke-width="2"></polyline>
          </svg>
        </span>
        {{ t('button_save') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import { useToast } from '../composables/useToast'

const props = defineProps({
  outputFormat: String,
  playlistContent: String
})

const emit = defineEmits(['update:outputFormat', 'save'])

const { t } = useTranslation()
const toast = useToast()
const localFormat = ref(props.outputFormat)

watch(() => props.outputFormat, (newVal) => {
  localFormat.value = newVal
})

const handleFormatChange = () => {
  emit('update:outputFormat', localFormat.value)
}

const handleCopy = async () => {
  if (!props.playlistContent) {
    toast.error(t.value('alert_create_first'))
    return
  }

  try {
    await navigator.clipboard.writeText(props.playlistContent)
    toast.success(t.value('toast_copied'))
  } catch (err) {
    toast.error(t.value('toast_copy_error'))
  }
}

const handleSave = () => {
  emit('save')
}
</script>

<style scoped>
.button-row {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.copy-button,
.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

.copy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  display: flex;
  align-items: center;
}
</style>
