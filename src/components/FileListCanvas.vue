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
    <div class="stats-bar">
      <span class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        {{ files.length }} {{ t('stats_tracks') }}
      </span>
      <span class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm3-4H6v-2h9v2zm3-4H6V7h12v2z"/>
        </svg>
        {{ formattedSize }}
      </span>
      <span class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
        ~{{ estimatedDuration }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  files: {
    type: Array,
    required: true
  },
  selectedIndex: {
    type: Number,
    default: -1
  }
})

// Computed properties for stats
const totalSize = computed(() => {
  return props.files.reduce((sum, file) => sum + (file.size || 0), 0)
})

const formattedSize = computed(() => {
  const bytes = totalSize.value
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const estimatedDuration = computed(() => {
  // Estimate based on average bitrate (~1 MB per minute for 128kbps MP3)
  // For higher quality files, this might be less accurate
  const totalMB = totalSize.value / (1024 * 1024)
  const estimatedMinutes = Math.round(totalMB * 1) // ~1 min per MB

  if (estimatedMinutes < 1) return '< 1 min'
  if (estimatedMinutes < 60) return `${estimatedMinutes} min`

  const hours = Math.floor(estimatedMinutes / 60)
  const mins = estimatedMinutes % 60
  return `${hours}h ${mins}min`
})

const emit = defineEmits(['clear', 'removeFile', 'moveFile', 'selectFile'])

const { t } = useTranslation()
const { currentTheme } = useTheme()

const canvasRef = ref(null)
const scrollY = ref(0)
const isDraggingScrollbar = ref(false)
const isDraggingFile = ref(false)
const dragStartY = ref(0)
const initialScrollY = ref(0)
const hoveredIndex = ref(-1)
const hoveredDragHandle = ref(-1)
const draggedFileIndex = ref(-1)
const dropTargetIndex = ref(-1)
const dragOffsetY = ref(0)
const currentDragY = ref(0)
const autoScrollInterval = ref(null)

const lineHeight = 28
const padding = 10
const deleteButtonSize = 18
const dragHandleWidth = 24
const autoScrollZone = 40 // pixels from edge to trigger auto-scroll
const autoScrollSpeed = 5 // pixels per frame

// Farbschema: #F2E28E, #A28680, #5E5F69, #AEAFB7, #0C0C10
const colors = {
  dark: {
    background: '#0C0C10',
    text: '#F2E28E',
    scrollbarTrack: 'rgba(174, 175, 183, 0.1)',
    scrollbarHandle: 'rgba(242, 226, 142, 0.4)',
    deleteButton: 'rgba(229, 115, 115, 0.6)',
    deleteButtonHover: '#e57373',
    deleteX: '#0C0C10',
    dragHandle: 'rgba(174, 175, 183, 0.4)',
    dragHandleHover: 'rgba(242, 226, 142, 0.7)',
    dropIndicator: '#F2E28E',
    draggedBg: 'rgba(242, 226, 142, 0.15)',
    selectedBg: 'rgba(242, 226, 142, 0.2)',
    selectedBorder: 'rgba(242, 226, 142, 0.5)'
  },
  light: {
    background: '#f5f5f5',
    text: '#A28680',
    scrollbarTrack: 'rgba(94, 95, 105, 0.1)',
    scrollbarHandle: 'rgba(162, 134, 128, 0.5)',
    deleteButton: 'rgba(211, 47, 47, 0.5)',
    deleteButtonHover: '#d32f2f',
    deleteX: '#ffffff',
    dragHandle: 'rgba(94, 95, 105, 0.4)',
    dragHandleHover: 'rgba(162, 134, 128, 0.8)',
    dropIndicator: '#A28680',
    draggedBg: 'rgba(162, 134, 128, 0.15)',
    selectedBg: 'rgba(162, 134, 128, 0.2)',
    selectedBorder: 'rgba(162, 134, 128, 0.6)'
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

const getDragHandleBounds = (index) => {
  const x = padding
  const y = (index * lineHeight) + padding - scrollY.value + (lineHeight - 16) / 2
  return { x, y, width: dragHandleWidth - 8, height: 16 }
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
    // Skip drawing the dragged file in its original position
    if (isDraggingFile.value && draggedFileIndex.value === index) return

    const y = (index * lineHeight) + (lineHeight / 2) + padding - scrollY.value

    if (y > -lineHeight && y < canvasHeight + lineHeight) {
      // Draw selection highlight
      if (props.selectedIndex === index) {
        const rowY = (index * lineHeight) + padding - scrollY.value
        ctx.fillStyle = theme.selectedBg
        ctx.fillRect(padding - 4, rowY + 2, canvasWidth - padding * 2 - scrollbarSpace + 8, lineHeight - 4)
        ctx.strokeStyle = theme.selectedBorder
        ctx.lineWidth = 1
        ctx.strokeRect(padding - 4, rowY + 2, canvasWidth - padding * 2 - scrollbarSpace + 8, lineHeight - 4)
      }

      // Draw drag handle (≡ symbol - 3 horizontal lines)
      const handle = getDragHandleBounds(index)
      const isHandleHovered = hoveredDragHandle.value === index
      ctx.strokeStyle = isHandleHovered ? theme.dragHandleHover : theme.dragHandle
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      for (let i = 0; i < 3; i++) {
        const lineY = handle.y + 3 + (i * 5)
        ctx.beginPath()
        ctx.moveTo(handle.x, lineY)
        ctx.lineTo(handle.x + handle.width, lineY)
        ctx.stroke()
      }

      // Draw file name (offset for drag handle)
      let text = `${index + 1}. ${file.name}`
      const textX = padding + dragHandleWidth
      const maxWidth = canvasWidth - textX - padding - deleteButtonSize - scrollbarSpace - 10

      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text).width > maxWidth && text.length > 5) {
          text = text.slice(0, -5) + '...'
        }
      }

      ctx.fillStyle = theme.text
      ctx.fillText(text, textX, y)

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

  // Draw drop indicator line
  if (isDraggingFile.value && dropTargetIndex.value >= 0) {
    const indicatorY = (dropTargetIndex.value * lineHeight) + padding - scrollY.value
    ctx.strokeStyle = theme.dropIndicator
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, indicatorY)
    ctx.lineTo(canvasWidth - padding - scrollbarSpace, indicatorY)
    ctx.stroke()

    // Draw small triangles at the ends
    ctx.fillStyle = theme.dropIndicator
    ctx.beginPath()
    ctx.moveTo(padding, indicatorY)
    ctx.lineTo(padding + 8, indicatorY - 4)
    ctx.lineTo(padding + 8, indicatorY + 4)
    ctx.fill()
  }

  // Draw the dragged file at cursor position
  if (isDraggingFile.value && draggedFileIndex.value >= 0 && draggedFileIndex.value < props.files.length) {
    const file = props.files[draggedFileIndex.value]
    const dragY = currentDragY.value - dragOffsetY.value

    // Background for dragged item
    ctx.fillStyle = theme.draggedBg
    ctx.fillRect(padding, dragY - lineHeight / 2 + 2, canvasWidth - padding * 2 - scrollbarSpace, lineHeight - 4)
    ctx.strokeStyle = theme.dropIndicator
    ctx.lineWidth = 1
    ctx.strokeRect(padding, dragY - lineHeight / 2 + 2, canvasWidth - padding * 2 - scrollbarSpace, lineHeight - 4)

    // Draw drag handle for dragged item
    ctx.strokeStyle = theme.dragHandleHover
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      const lineY = dragY - 7 + (i * 5)
      ctx.beginPath()
      ctx.moveTo(padding, lineY)
      ctx.lineTo(padding + dragHandleWidth - 8, lineY)
      ctx.stroke()
    }

    // Draw file name
    let text = `${draggedFileIndex.value + 1}. ${file.name}`
    const textX = padding + dragHandleWidth
    const maxWidth = canvasWidth - textX - padding - deleteButtonSize - scrollbarSpace - 10

    if (ctx.measureText(text).width > maxWidth) {
      while (ctx.measureText(text).width > maxWidth && text.length > 5) {
        text = text.slice(0, -5) + '...'
      }
    }

    ctx.fillStyle = theme.text
    ctx.fillText(text, textX, dragY)
  }

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

// Auto-scroll functions for drag & drop
const startAutoScroll = (direction) => {
  if (autoScrollInterval.value) return

  autoScrollInterval.value = setInterval(() => {
    const geo = getScrollbarGeometry()
    if (!geo) {
      stopAutoScroll()
      return
    }

    if (direction === 'up') {
      scrollY.value = Math.max(0, scrollY.value - autoScrollSpeed)
    } else if (direction === 'down') {
      scrollY.value = Math.min(geo.maxScroll, scrollY.value + autoScrollSpeed)
    }

    // Update drop target based on current scroll position
    const adjustedY = currentDragY.value + scrollY.value - padding + (lineHeight / 2)
    let targetIndex = Math.floor(adjustedY / lineHeight)
    targetIndex = Math.max(0, Math.min(targetIndex, props.files.length))
    dropTargetIndex.value = targetIndex

    drawFilesOnCanvas()
  }, 16) // ~60fps
}

const stopAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
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
  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top

  // Check if clicking on drag handle
  const fileIndex = getFileIndexAtPosition(mY)
  if (fileIndex >= 0) {
    const handle = getDragHandleBounds(fileIndex)
    if (mX >= handle.x && mX <= handle.x + handle.width + 5 &&
        mY >= handle.y && mY <= handle.y + handle.height) {
      isDraggingFile.value = true
      draggedFileIndex.value = fileIndex
      const fileY = (fileIndex * lineHeight) + (lineHeight / 2) + padding - scrollY.value
      dragOffsetY.value = mY - fileY
      currentDragY.value = mY
      dropTargetIndex.value = fileIndex
      canvasRef.value.style.cursor = 'grabbing'
      drawFilesOnCanvas()
      return
    }
  }

  // Check scrollbar
  const geo = getScrollbarGeometry()
  if (!geo) return

  if (mX >= geo.scrollbarX &&
      mX <= geo.scrollbarX + geo.scrollbarWidth &&
      mY >= geo.handleY &&
      mY <= geo.handleY + geo.scrollbarHandleHeight) {
    isDraggingScrollbar.value = true
    dragStartY.value = mY
    initialScrollY.value = scrollY.value
    canvasRef.value.style.cursor = 'grabbing'
  }
}

const handleMouseMove = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const mY = e.clientY - rect.top
  const canvasHeight = rect.height

  // Handle file dragging
  if (isDraggingFile.value) {
    currentDragY.value = mY

    // Calculate drop target index
    const adjustedY = mY + scrollY.value - padding + (lineHeight / 2)
    let targetIndex = Math.floor(adjustedY / lineHeight)
    targetIndex = Math.max(0, Math.min(targetIndex, props.files.length))
    dropTargetIndex.value = targetIndex

    // Auto-scroll when near edges
    const geo = getScrollbarGeometry()
    if (geo) {
      if (mY < autoScrollZone && scrollY.value > 0) {
        startAutoScroll('up')
      } else if (mY > canvasHeight - autoScrollZone && scrollY.value < geo.maxScroll) {
        startAutoScroll('down')
      } else {
        stopAutoScroll()
      }
    }

    drawFilesOnCanvas()
    return
  }

  // Handle scrollbar dragging
  if (isDraggingScrollbar.value) {
    const geo = getScrollbarGeometry()
    if (!geo) {
      isDraggingScrollbar.value = false
      return
    }

    const dY = mY - dragStartY.value
    const maxHandleTravel = geo.visibleHeight - geo.scrollbarHandleHeight
    const scrollDelta = (dY / maxHandleTravel) * geo.maxScroll

    scrollY.value = Math.max(0, Math.min(initialScrollY.value + scrollDelta, geo.maxScroll))
    drawFilesOnCanvas()
    return
  }

  // Normal hover handling
  updateCursor(e)
  updateHover(e)
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
  let newHoveredDragHandle = -1

  if (fileIndex >= 0) {
    // Check delete button hover
    const btn = getDeleteButtonBounds(fileIndex, canvasWidth)
    if (mX >= btn.x && mX <= btn.x + btn.width &&
        mY >= btn.y && mY <= btn.y + btn.height) {
      newHoveredIndex = fileIndex
    }

    // Check drag handle hover
    const handle = getDragHandleBounds(fileIndex)
    if (mX >= handle.x && mX <= handle.x + handle.width + 5 &&
        mY >= handle.y && mY <= handle.y + handle.height) {
      newHoveredDragHandle = fileIndex
    }
  }

  let needsRedraw = false
  if (newHoveredIndex !== hoveredIndex.value) {
    hoveredIndex.value = newHoveredIndex
    needsRedraw = true
  }
  if (newHoveredDragHandle !== hoveredDragHandle.value) {
    hoveredDragHandle.value = newHoveredDragHandle
    needsRedraw = true
  }

  if (needsRedraw) {
    drawFilesOnCanvas()
  }
}

const handleClick = (e) => {
  if (!canvasRef.value) return

  // Don't process clicks if we were dragging
  if (isDraggingFile.value || isDraggingScrollbar.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvasRef.value.width / dpr

  const fileIndex = getFileIndexAtPosition(mY)

  if (fileIndex >= 0) {
    // Don't trigger click on drag handle area
    const handle = getDragHandleBounds(fileIndex)
    if (mX >= handle.x && mX <= handle.x + handle.width + 5 &&
        mY >= handle.y && mY <= handle.y + handle.height) {
      return
    }

    // Check delete button
    const btn = getDeleteButtonBounds(fileIndex, canvasWidth)
    if (mX >= btn.x && mX <= btn.x + btn.width &&
        mY >= btn.y && mY <= btn.y + btn.height) {
      emit('removeFile', fileIndex)
      return
    }

    // Click on file row - select it
    emit('selectFile', fileIndex)
  } else {
    // Click outside files - deselect
    emit('selectFile', -1)
  }
}

const handleMouseLeave = () => {
  let needsRedraw = false
  if (hoveredIndex.value !== -1) {
    hoveredIndex.value = -1
    needsRedraw = true
  }
  if (hoveredDragHandle.value !== -1) {
    hoveredDragHandle.value = -1
    needsRedraw = true
  }
  if (needsRedraw) {
    drawFilesOnCanvas()
  }
}

const handleMouseUp = () => {
  // Handle file drag end
  if (isDraggingFile.value) {
    stopAutoScroll() // Stop auto-scroll when drag ends

    const fromIndex = draggedFileIndex.value
    const toIndex = dropTargetIndex.value

    // Only emit move if the position changed
    if (fromIndex !== toIndex && fromIndex !== toIndex - 1) {
      emit('moveFile', fromIndex, toIndex > fromIndex ? toIndex - 1 : toIndex)
    }

    isDraggingFile.value = false
    draggedFileIndex.value = -1
    dropTargetIndex.value = -1
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'default'
    }
    drawFilesOnCanvas()
    return
  }

  // Handle scrollbar drag end
  if (isDraggingScrollbar.value) {
    isDraggingScrollbar.value = false
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'grab'
    }
  }
}

const updateCursor = (e) => {
  if (!canvasRef.value || isDraggingFile.value || isDraggingScrollbar.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const mX = e.clientX - rect.left
  const mY = e.clientY - rect.top
  const dpr = window.devicePixelRatio || 1
  const canvasWidth = canvasRef.value.width / dpr

  const fileIndex = getFileIndexAtPosition(mY)
  if (fileIndex >= 0) {
    // Check drag handle hover
    const handle = getDragHandleBounds(fileIndex)
    if (mX >= handle.x && mX <= handle.x + handle.width + 5 &&
        mY >= handle.y && mY <= handle.y + handle.height) {
      canvasRef.value.style.cursor = 'grab'
      return
    }

    // Check delete button hover
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
  stopAutoScroll() // Clean up interval on unmount
})

// Watch for changes
watch(() => props.files, () => {
  scrollY.value = 0
  resizeCanvas()
}, { deep: true })

watch(currentTheme, () => {
  drawFilesOnCanvas()
})

watch(() => props.selectedIndex, () => {
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

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  background: var(--panel-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--muted-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-item svg {
  opacity: 0.7;
}

@media (max-width: 480px) {
  .stats-bar {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
