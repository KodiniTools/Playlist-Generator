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
      @click="handleClick"
      @mouseleave="handleMouseLeave"
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

const emit = defineEmits(['clear', 'removeFile'])

const { t } = useTranslation()
const { currentTheme } = useTheme()

const canvasRef = ref(null)
const scrollY = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const initialScrollY = ref(0)
const hoveredIndex = ref(-1)

const lineHeight = 28
const padding = 10
const deleteButtonSize = 18

// Farbschema: #F2E28E, #A28680, #5E5F69, #AEAFB7, #0C0C10
const colors = {
  dark: {
    background: '#0C0C10',
    text: '#F2E28E',
    scrollbarTrack: 'rgba(174, 175, 183, 0.1)',
    scrollbarHandle: 'rgba(242, 226, 142, 0.4)',
    deleteButton: 'rgba(229, 115, 115, 0.6)',
    deleteButtonHover: '#e57373',
    deleteX: '#0C0C10'
  },
  light: {
    background: '#f5f5f5',
    text: '#A28680',
    scrollbarTrack: 'rgba(94, 95, 105, 0.1)',
    scrollbarHandle: 'rgba(162, 134, 128, 0.5)',
    deleteButton: 'rgba(211, 47, 47, 0.5)',
    deleteButtonHover: '#d32f2f',
    deleteX: '#ffffff'
  }
}

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

const getDeleteButtonBounds = (index, canvasWidth) => {
  const geo = getScrollbarGeometry()
  const scrollbarSpace = geo ? 20 : 10
  const x = canvasWidth - deleteButtonSize - padding - scrollbarSpace
  const y = (index * lineHeight) + padding - scrollY.value + (lineHeight - deleteButtonSize) / 2
  return { x, y, width: deleteButtonSize, height: deleteButtonSize }
}

const getFileIndexAtPosition = (mY) => {
  const adjustedY = mY + scrollY.value - padding
  const index = Math.floor(adjustedY / lineHeight)
  if (index >= 0 && index < props.files.length) {
    return index
  }
  return -1
}

const drawFilesOnCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvas.width / dpr
  const canvasHeight = canvas.height / dpr
  const isLight = currentTheme.value === 'light'
  const theme = isLight ? colors.light : colors.dark

  // Clear canvas
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  if (!props.files.length) return

  // Draw files
  ctx.font = '14px Segoe UI'
  ctx.textBaseline = 'middle'

  const geo = getScrollbarGeometry()
  const scrollbarSpace = geo ? 30 : 10

  props.files.forEach((file, index) => {
    const y = (index * lineHeight) + (lineHeight / 2) + padding - scrollY.value

    if (y > -lineHeight && y < canvasHeight + lineHeight) {
      // Draw file name
      let text = `${index + 1}. ${file.name}`
      const maxWidth = canvasWidth - (padding * 2) - deleteButtonSize - scrollbarSpace - 10

      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text).width > maxWidth && text.length > 5) {
          text = text.slice(0, -5) + '...'
        }
      }

      ctx.fillStyle = theme.text
      ctx.fillText(text, padding, y)

      // Draw delete button
      const btn = getDeleteButtonBounds(index, canvasWidth)
      const isHovered = hoveredIndex.value === index

      // Button background (circle)
      ctx.beginPath()
      ctx.arc(btn.x + btn.width / 2, btn.y + btn.height / 2, btn.width / 2, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? theme.deleteButtonHover : theme.deleteButton
      ctx.fill()

      // X symbol
      ctx.strokeStyle = theme.deleteX
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      const xPadding = 5
      ctx.beginPath()
      ctx.moveTo(btn.x + xPadding, btn.y + xPadding)
      ctx.lineTo(btn.x + btn.width - xPadding, btn.y + btn.height - xPadding)
      ctx.moveTo(btn.x + btn.width - xPadding, btn.y + xPadding)
      ctx.lineTo(btn.x + xPadding, btn.y + btn.height - xPadding)
      ctx.stroke()
    }
  })

  // Draw scrollbar
  if (geo) {
    ctx.fillStyle = theme.scrollbarTrack
    ctx.fillRect(geo.scrollbarX, 0, geo.scrollbarWidth, geo.visibleHeight)

    ctx.fillStyle = theme.scrollbarHandle
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
    updateHover(e)
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

const updateHover = (e) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvasRef.value.width / dpr

  const fileIndex = getFileIndexAtPosition(mY)
  let newHoveredIndex = -1

  if (fileIndex >= 0) {
    const btn = getDeleteButtonBounds(fileIndex, canvasWidth)
    if (mX >= btn.x && mX <= btn.x + btn.width &&
        mY >= btn.y && mY <= btn.y + btn.height) {
      newHoveredIndex = fileIndex
    }
  }

  if (newHoveredIndex !== hoveredIndex.value) {
    hoveredIndex.value = newHoveredIndex
    drawFilesOnCanvas()
  }
}

const handleClick = (e) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvasRef.value.width / dpr

  const fileIndex = getFileIndexAtPosition(mY)

  if (fileIndex >= 0) {
    const btn = getDeleteButtonBounds(fileIndex, canvasWidth)
    if (mX >= btn.x && mX <= btn.x + btn.width &&
        mY >= btn.y && mY <= btn.y + btn.height) {
      emit('removeFile', fileIndex)
    }
  }
}

const handleMouseLeave = () => {
  if (hoveredIndex.value !== -1) {
    hoveredIndex.value = -1
    drawFilesOnCanvas()
  }
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

  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvasRef.value.width / dpr

  // Check delete button hover
  const fileIndex = getFileIndexAtPosition(mY)
  if (fileIndex >= 0) {
    const btn = getDeleteButtonBounds(fileIndex, canvasWidth)
    if (mX >= btn.x && mX <= btn.x + btn.width &&
        mY >= btn.y && mY <= btn.y + btn.height) {
      canvasRef.value.style.cursor = 'pointer'
      return
    }
  }

  // Check scrollbar hover
  const geo = getScrollbarGeometry()
  if (geo && mX >= geo.scrollbarX &&
      mX <= geo.scrollbarX + geo.scrollbarWidth &&
      mY >= geo.handleY &&
      mY <= geo.handleY + geo.scrollbarHandleHeight) {
    canvasRef.value.style.cursor = 'grab'
    return
  }

  canvasRef.value.style.cursor = 'default'
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
  display: block !important;
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
  color: var(--accent-color);
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
  transition: transform 0.2s ease;
}

.clear-button:hover {
  transform: scale(1.1);
}

#fileListCanvas {
  width: 100%;
  height: 250px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  display: block;
}
</style>
