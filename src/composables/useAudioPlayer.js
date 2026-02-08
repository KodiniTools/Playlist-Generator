import { ref, watch, onUnmounted, computed } from 'vue'

export function useAudioPlayer(filesRef) {
  const audio = new Audio()
  const objectUrls = new Map() // file name -> blob URL

  // Player state
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentTrackIndex = ref(-1)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.7)
  const isMuted = ref(false)

  // Ordered playlist derived from files
  const playlist = computed(() => filesRef.value.map((file, index) => ({
    index,
    name: file.name,
    title: file.name.replace(/\.[^/.]+$/, ''),
    file
  })))

  const currentTrack = computed(() => {
    if (currentTrackIndex.value >= 0 && currentTrackIndex.value < playlist.value.length) {
      return playlist.value[currentTrackIndex.value]
    }
    return null
  })

  // Create or retrieve object URL for a file
  const getObjectUrl = (file) => {
    const key = file.name + '_' + file.size + '_' + file.lastModified
    if (!objectUrls.has(key)) {
      objectUrls.set(key, URL.createObjectURL(file))
    }
    return objectUrls.get(key)
  }

  // Clean up all object URLs
  const revokeAllUrls = () => {
    objectUrls.forEach(url => URL.revokeObjectURL(url))
    objectUrls.clear()
  }

  // Load and play a track by index
  const loadTrack = (index) => {
    if (index < 0 || index >= filesRef.value.length) return false

    const file = filesRef.value[index]
    const url = getObjectUrl(file)

    audio.src = url
    audio.load()
    currentTrackIndex.value = index
    currentTime.value = 0
    duration.value = 0
    return true
  }

  const play = (index) => {
    if (typeof index === 'number') {
      if (!loadTrack(index)) return
    } else if (currentTrackIndex.value === -1 && filesRef.value.length > 0) {
      if (!loadTrack(0)) return
    }

    audio.play().then(() => {
      isPlaying.value = true
      isPaused.value = false
    }).catch(err => {
      console.error('Playback failed:', err)
    })
  }

  const pause = () => {
    audio.pause()
    isPlaying.value = false
    isPaused.value = true
  }

  const stop = () => {
    audio.pause()
    audio.currentTime = 0
    isPlaying.value = false
    isPaused.value = false
    currentTime.value = 0
  }

  const togglePlay = () => {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  const next = () => {
    if (filesRef.value.length === 0) return
    const nextIndex = (currentTrackIndex.value + 1) % filesRef.value.length
    play(nextIndex)
  }

  const previous = () => {
    if (filesRef.value.length === 0) return
    // If more than 3 seconds in, restart current track
    if (currentTime.value > 3) {
      audio.currentTime = 0
      return
    }
    const prevIndex = currentTrackIndex.value <= 0
      ? filesRef.value.length - 1
      : currentTrackIndex.value - 1
    play(prevIndex)
  }

  const seek = (time) => {
    if (duration.value > 0) {
      audio.currentTime = time
      currentTime.value = time
    }
  }

  const setVolume = (val) => {
    volume.value = Math.max(0, Math.min(1, val))
    audio.volume = volume.value
    if (volume.value > 0) {
      isMuted.value = false
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    audio.muted = isMuted.value
  }

  // Audio event listeners
  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
  })

  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })

  audio.addEventListener('durationchange', () => {
    if (audio.duration && isFinite(audio.duration)) {
      duration.value = audio.duration
    }
  })

  audio.addEventListener('ended', () => {
    next()
  })

  audio.addEventListener('error', () => {
    isPlaying.value = false
    isPaused.value = false
  })

  // Set initial volume
  audio.volume = volume.value

  // Watch for file list changes to keep player in sync
  // When files are reordered, find the currently playing track in the new order
  let currentPlayingFileName = null

  watch(() => filesRef.value, (newFiles) => {
    if (currentTrackIndex.value >= 0 && currentPlayingFileName) {
      // Find the track in the new order
      const newIndex = newFiles.findIndex(f => f.name === currentPlayingFileName)
      if (newIndex >= 0) {
        // Track still exists, update index without interrupting playback
        currentTrackIndex.value = newIndex
      } else {
        // Track was removed, stop playback
        stop()
        currentTrackIndex.value = -1
        currentPlayingFileName = null
      }
    }

    // If all files were cleared, reset player
    if (newFiles.length === 0) {
      stop()
      currentTrackIndex.value = -1
      currentPlayingFileName = null
      revokeAllUrls()
    }
  }, { deep: true })

  // Track the currently playing file name for sync purposes
  watch(currentTrackIndex, (index) => {
    if (index >= 0 && index < filesRef.value.length) {
      currentPlayingFileName = filesRef.value[index].name
    } else {
      currentPlayingFileName = null
    }
  })

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  onUnmounted(() => {
    audio.pause()
    audio.src = ''
    revokeAllUrls()
  })

  return {
    // State
    isPlaying,
    isPaused,
    currentTrackIndex,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    // Methods
    play,
    pause,
    stop,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    formatTime
  }
}
