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
      class="generate-button"
      @click="handleSave"
    >
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
