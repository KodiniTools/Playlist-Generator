<template>
  <div class="file-info" v-show="files.length > 0">
    <div class="canvas-header">
      <h3>{{ t('canvas_title') }}</h3>
      <button 
        type="button" 
        class="clear-button" 
        :title="t('button_clear_title')"
        @click="$emit('clear')"
      >
        🗑️
      </button>
    </div>
    <canvas 
      ref="canvasRef" 
      id="fileListCanvas"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  files: {
    type: Array,
    required: true
  }
})

defineEmits(['clear'])

const { t } = useTranslation()
const { currentTheme } = useTheme()

const canvasRef = ref(null)
const scrollY = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const initialScrollY = ref(0)

const lineHeight = 28
const padding = 10

const getScrollbarGeometry = () => {
  if (!canvasRef.value) return null
  
  const dpr = window.devicePixelRatio || 1
  const visibleHeight = canvasRef.value.getBoundingClientRect().height
  const totalContentHeight = (props.files.length * lineHeight) + (padding * 2)
  
  if (totalContentHeight <= visibleHeight) return null
  
  const maxScroll = totalContentHeight - visibleHeight
  const scrollbarWidth = 8
  const scrollbarX = (canvasRef.value.width / dpr) - scrollbarWidth - 2
  const scrollbarHandleHeight = Math.max(20, (visibleHeight / totalContentHeight) * visibleHeight)
  const maxHandleTravel = visibleHeight - scrollbarHandleHeight
  const handleY = (scrollY.value / maxScroll) * maxHandleTravel
  
  return { visibleHeight, maxScroll, scrollbarX, scrollbarWidth, handleY, scrollbarHandleHeight }
}

const drawFilesOnCanvas = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvas.width / dpr
  const canvasHeight = canvas.height / dpr
  const isLight = currentTheme.value === 'light'
  
  // Clear canvas
  ctx.fillStyle = isLight ? '#F0F0F0' : '#0a0a0a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  if (!props.files.length) return
  
  // Draw files
  ctx.font = '14px Segoe UI'
  ctx.textBaseline = 'middle'
  
  props.files.forEach((file, index) => {
    const y = (index * lineHeight) + (lineHeight / 2) + padding - scrollY.value
    
    if (y > -lineHeight && y < canvasHeight + lineHeight) {
      let text = `${index + 1}. ${file.name}`
      const maxWidth = canvasWidth - (padding * 3) - 10
      
      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text).width > maxWidth && text.length > 5) {
          text = text.slice(0, -5) + '...'
        }
      }
      
      ctx.fillStyle = '#FFD700'  // Gelbe Farbe für alle Tracks
      ctx.fillText(text, padding, y)
    }
  })
  
  // Draw scrollbar
  const geo = getScrollbarGeometry()
  if (geo) {
    ctx.fillStyle = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
    ctx.fillRect(geo.scrollbarX, 0, geo.scrollbarWidth, geo.visibleHeight)
    
    ctx.fillStyle = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'
    ctx.fillRect(geo.scrollbarX, geo.handleY, geo.scrollbarWidth, geo.scrollbarHandleHeight)
  }
}

const resizeCanvas = () => {
  if (!canvasRef.value) return
  
  const dpr = window.devicePixelRatio || 1
  const rect = canvasRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width * dpr
  canvasRef.value.height = rect.height * dpr
  
  const ctx = canvasRef.value.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  
  drawFilesOnCanvas()
}

const handleWheel = (e) => {
  e.preventDefault()
  const geo = getScrollbarGeometry()
  if (!geo) return
  
  scrollY.value += e.deltaY * 0.5
  scrollY.value = Math.max(0, Math.min(scrollY.value, geo.maxScroll))
  drawFilesOnCanvas()
}

const handleMouseDown = (e) => {
  const geo = getScrollbarGeometry()
  if (!geo) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  
  if (mX >= geo.scrollbarX && 
      mX <= geo.scrollbarX + geo.scrollbarWidth &&
      mY >= geo.handleY && 
      mY <= geo.handleY + geo.scrollbarHandleHeight) {
    isDragging.value = true
    dragStartY.value = mY
    initialScrollY.value = scrollY.value
    canvasRef.value.style.cursor = 'grabbing'
  }
}

const handleMouseMove = (e) => {
  if (!isDragging.value) {
    updateCursor(e)
    return
  }
  
  const geo = getScrollbarGeometry()
  if (!geo) {
    isDragging.value = false
    return
  }
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mY = e.clientY - rect.top
  const dY = mY - dragStartY.value
  const maxHandleTravel = geo.visibleHeight - geo.scrollbarHandleHeight
  const scrollDelta = (dY / maxHandleTravel) * geo.maxScroll
  
  scrollY.value = Math.max(0, Math.min(initialScrollY.value + scrollDelta, geo.maxScroll))
  drawFilesOnCanvas()
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'grab'
    }
  }
}

const updateCursor = (e) => {
  if (!canvasRef.value || isDragging.value) return
  
  const geo = getScrollbarGeometry()
  if (!geo) {
    canvasRef.value.style.cursor = 'default'
    return
  }
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  
  if (mX >= geo.scrollbarX && 
      mX <= geo.scrollbarX + geo.scrollbarWidth &&
      mY >= geo.handleY && 
      mY <= geo.handleY + geo.scrollbarHandleHeight) {
    canvasRef.value.style.cursor = 'grab'
  } else {
    canvasRef.value.style.cursor = 'default'
  }
}

onMounted(() => {
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('mousemove', handleMouseMove)
  resizeCanvas()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('mousemove', handleMouseMove)
})

// Watch for changes
watch(() => props.files, () => {
  scrollY.value = 0
  resizeCanvas()
}, { deep: true })

watch(currentTheme, () => {
  drawFilesOnCanvas()
})
</script>

<style scoped>
.file-info {
  margin: 1rem 0;
  display: block !important;  /* Überschreibt das globale display: none */
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.canvas-header h3 {
  margin: 0;
  font-size: 1rem;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
}

#fileListCanvas {
  width: 100%;
  height: 250px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: block;
}
</style>
