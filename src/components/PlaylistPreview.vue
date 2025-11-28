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
    <button
      type="button"
      class="save-button"
      @click="handleSave"
    >
      <span class="save-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke="currentColor" stroke-width="2"></path>
          <polyline points="17 21 17 13 7 13 7 21" fill="none" stroke="currentColor" stroke-width="2"></polyline>
          <polyline points="7 3 7 8 15 8" fill="none" stroke="currentColor" stroke-width="2"></polyline>
        </svg>
      </span>
      {{ t('button_save') }}
    </button>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps({
  outputFormat: String,
  playlistContent: String
})

const emit = defineEmits(['update:outputFormat', 'save', 'generate'])

const { t } = useTranslation()
const localFormat = ref(props.outputFormat)

watch(() => props.outputFormat, (newVal) => {
  localFormat.value = newVal
})

const handleFormatChange = () => {
  emit('update:outputFormat', localFormat.value)
  emit('generate')
}

const handleSave = () => {
  emit('save')
}
</script>

<style scoped>
.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.save-icon {
  display: flex;
  align-items: center;
}
</style>
