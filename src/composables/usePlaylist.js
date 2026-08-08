import { ref, computed, watch } from 'vue'

// Module-level singleton state — survives component destroy/recreate
// (same pattern as useTranslation.js)
const files = ref([])
const sortOption = ref('alphabetical')
const playlistName = ref('meine_playliste')
const outputFormat = ref('m3u')
const playlistContent = ref('')
const replaceMode = ref(false)
const selectedFileIndex = ref(-1)
const lastRemoved = ref(null) // { file, index } snapshot for undo
// Files that are UNCHECKED (excluded from the generated playlist). Tracked by
// File reference. Default = empty → every file is checked/included.
const excludedFiles = ref(new Set())

// The ordered subset of files that are checked and thus included in the output.
const includedFiles = () => files.value.filter((f) => !excludedFiles.value.has(f))

const isFileSelected = (file) => !excludedFiles.value.has(file)

const selectedCount = computed(() =>
  files.value.reduce((n, f) => n + (excludedFiles.value.has(f) ? 0 : 1), 0),
)
const allSelected = computed(
  () => files.value.length > 0 && selectedCount.value === files.value.length,
)
const someSelected = computed(
  () => selectedCount.value > 0 && selectedCount.value < files.value.length,
)

const toggleFileSelected = (index) => {
  const file = files.value[index]
  if (!file) return
  const next = new Set(excludedFiles.value)
  if (next.has(file)) next.delete(file)
  else next.add(file)
  excludedFiles.value = next
  generatePlaylist()
}

const setAllSelected = (selected) => {
  excludedFiles.value = selected ? new Set() : new Set(files.value)
  generatePlaylist()
}

const supportedFormats = ['.mp3', '.wav', '.flac']

const escapeXml = (str) => {
  return str.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return char
    }
  })
}

const generateM3u = (list) => {
  let output = '#EXTM3U\n'
  list.forEach((file) => {
    const title = file.name.replace(/\.[^/.]+$/, '')
    output += `#EXTINF:-1,${title}\n${file.name}\n`
  })
  return output
}

// M3U8 is the UTF-8 encoded variant of M3U — identical content, but the
// .m3u8 extension signals UTF-8 so titles with umlauts / non-Latin
// characters are interpreted correctly by players.
const generateM3u8 = (list) => generateM3u(list)

const generatePls = (list) => {
  let output = '[playlist]\n'
  list.forEach((file, index) => {
    const n = index + 1
    const title = file.name.replace(/\.[^/.]+$/, '')
    output += `File${n}=${file.name}\n`
    output += `Title${n}=${title}\n`
    output += `Length${n}=-1\n`
  })
  output += `NumberOfEntries=${list.length}\n`
  output += 'Version=2\n'
  return output
}

const generateTxt = (list) => {
  return list.map((file) => file.name).join('\n') + '\n'
}

// Map an audio extension to a CUE sheet FILE type. Non-standard types
// (e.g. FLAC/OGG) fall back to WAVE, which players accept.
const cueFileType = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'mp3') return 'MP3'
  if (ext === 'aiff' || ext === 'aif') return 'AIFF'
  return 'WAVE'
}

const generateCue = (list) => {
  let output = `TITLE "${playlistName.value.replace(/"/g, "'")}"\n`
  list.forEach((file, index) => {
    const title = file.name.replace(/\.[^/.]+$/, '').replace(/"/g, "'")
    const trackNum = String(index + 1).padStart(2, '0')
    output += `FILE "${file.name.replace(/"/g, "'")}" ${cueFileType(file.name)}\n`
    output += `  TRACK ${trackNum} AUDIO\n`
    output += `    TITLE "${title}"\n`
    output += `    INDEX 01 00:00:00\n`
  })
  return output
}

// Escape a value for CSV (RFC 4180): wrap in quotes and double any
// embedded quotes when it contains a comma, quote or newline.
const escapeCsv = (value) => {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const generateCsv = (list) => {
  const header = 'Filename,Title,Size (Bytes)'
  const rows = list.map((file) => {
    const title = file.name.replace(/\.[^/.]+$/, '')
    return [escapeCsv(file.name), escapeCsv(title), escapeCsv(file.size ?? '')].join(',')
  })
  return [header, ...rows].join('\r\n') + '\r\n'
}

const generateJson = (list) => {
  const playlistData = list.map((file) => ({
    filename: file.name,
    title: file.name.replace(/\.[^/.]+$/, ''),
    size: file.size,
  }))
  return JSON.stringify(playlistData, null, 4)
}

const generateXspf = (list) => {
  const tracks = list
    .map((file) => {
      const title = escapeXml(file.name.replace(/\.[^/.]+$/, ''))
      const location = escapeXml(file.name)
      return `    <track>\n      <location>${location}</location>\n      <title>${title}</title>\n    </track>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <title>${escapeXml(playlistName.value)}</title>
  <trackList>
${tracks}
  </trackList>
</playlist>`
}

const generatePlaylist = () => {
  // Only checked tracks are written to the playlist.
  const list = includedFiles()
  if (list.length === 0) {
    playlistContent.value = ''
    return
  }

  switch (outputFormat.value) {
    case 'm3u':
      playlistContent.value = generateM3u(list)
      break
    case 'm3u8':
      playlistContent.value = generateM3u8(list)
      break
    case 'pls':
      playlistContent.value = generatePls(list)
      break
    case 'txt':
      playlistContent.value = generateTxt(list)
      break
    case 'cue':
      playlistContent.value = generateCue(list)
      break
    case 'csv':
      playlistContent.value = generateCsv(list)
      break
    case 'json':
      playlistContent.value = generateJson(list)
      break
    case 'xspf':
      playlistContent.value = generateXspf(list)
      break
    default:
      playlistContent.value = 'Unsupported format.'
  }
}

const addFiles = (fileList) => {
  const validFiles = Array.from(fileList).filter((f) =>
    supportedFormats.some((ext) => f.name.toLowerCase().endsWith(ext)),
  )

  if (replaceMode.value) {
    // Replace mode: clear and add all new files (all checked by default)
    excludedFiles.value = new Set()
    files.value = validFiles
    sortFiles()
    generatePlaylist()
    return { added: validFiles.length, skipped: 0 }
  }

  // Append mode: check for duplicates by filename
  const existingNames = new Set(files.value.map((f) => f.name.toLowerCase()))
  const newFiles = []
  let skipped = 0

  for (const file of validFiles) {
    if (existingNames.has(file.name.toLowerCase())) {
      skipped++
    } else {
      newFiles.push(file)
      existingNames.add(file.name.toLowerCase())
    }
  }

  files.value = [...files.value, ...newFiles]
  sortFiles()
  generatePlaylist()
  return { added: newFiles.length, skipped }
}

const clearFiles = () => {
  files.value = []
  excludedFiles.value = new Set()
  playlistContent.value = ''
}

const removeFile = (index) => {
  if (index >= 0 && index < files.value.length) {
    const file = files.value[index]
    lastRemoved.value = { file, index }
    files.value.splice(index, 1)
    if (excludedFiles.value.has(file)) {
      const next = new Set(excludedFiles.value)
      next.delete(file)
      excludedFiles.value = next
    }
    generatePlaylist()
  }
}

const undoRemove = () => {
  if (!lastRemoved.value) return false
  const { file, index } = lastRemoved.value
  const insertAt = Math.min(index, files.value.length)
  files.value.splice(insertAt, 0, file)
  lastRemoved.value = null
  generatePlaylist()
  return true
}

const clearUndo = () => {
  lastRemoved.value = null
}

const moveFile = (fromIndex, toIndex) => {
  if (fromIndex < 0 || fromIndex >= files.value.length) return
  if (toIndex < 0 || toIndex >= files.value.length) return
  if (fromIndex === toIndex) return

  const [movedFile] = files.value.splice(fromIndex, 1)
  files.value.splice(toIndex, 0, movedFile)

  // Switch to manual sort mode when user manually reorders
  sortOption.value = 'manual'
  generatePlaylist()
}

const sortFiles = () => {
  const option = sortOption.value
  // Manual mode: don't sort, keep user's order
  if (option === 'manual') {
    generatePlaylist()
    return
  }

  if (option === 'alphabetical') {
    files.value.sort((a, b) => a.name.localeCompare(b.name))
  } else if (option === 'date') {
    files.value.sort((a, b) => a.lastModified - b.lastModified)
  } else if (option === 'random') {
    for (let i = files.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[files.value[i], files.value[j]] = [files.value[j], files.value[i]]
    }
  }
  generatePlaylist()
}

const analyzeBlob = async (blob, name) => {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  audioContext.close()

  // Create a File object from the Blob so it integrates with the existing playlist system
  const file = new File([blob], name, {
    type: blob.type || 'audio/wav',
    lastModified: Date.now(),
  })

  return {
    file,
    name,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
  }
}

const handleSharedFiles = async (sharedRecords) => {
  let processed = 0

  for (const record of sharedRecords) {
    const blob =
      record.blob instanceof Blob
        ? record.blob
        : new Blob([record.blob], { type: record.mimeType || 'audio/wav' })

    if (blob.size === 0) continue

    try {
      const result = await analyzeBlob(blob, record.name)
      // Check for duplicates
      const existingNames = new Set(files.value.map((f) => f.name.toLowerCase()))
      if (!existingNames.has(result.file.name.toLowerCase())) {
        files.value = [...files.value, result.file]
        processed++
      }
    } catch (err) {
      console.warn('Could not process shared file:', record.name, err)
    }
  }

  if (processed > 0) {
    sortFiles()
    generatePlaylist()
  }

  return { processed }
}

const savePlaylist = async () => {
  if (!playlistContent.value) {
    return false
  }

  const formatDetails = {
    m3u: { ext: '.m3u', mime: 'audio/x-mpegurl' },
    m3u8: { ext: '.m3u8', mime: 'application/vnd.apple.mpegurl' },
    pls: { ext: '.pls', mime: 'audio/x-scpls' },
    txt: { ext: '.txt', mime: 'text/plain' },
    cue: { ext: '.cue', mime: 'application/x-cue' },
    csv: { ext: '.csv', mime: 'text/csv' },
    json: { ext: '.json', mime: 'application/json' },
    xspf: { ext: '.xspf', mime: 'application/xspf+xml' },
  }

  const details = formatDetails[outputFormat.value]
  if (!details) return false

  const options = {
    suggestedName: `${playlistName.value}${details.ext}`,
    types: [
      {
        description: `${outputFormat.value.toUpperCase()} Playlist`,
        accept: { [details.mime]: [details.ext] },
      },
    ],
  }

  try {
    const handle = await window.showSaveFilePicker(options)
    const writable = await handle.createWritable()
    await writable.write(playlistContent.value)
    await writable.close()
    return true
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Could not save the file:', err)
      return false
    }
    return null // User cancelled
  }
}

// Auto-regenerate playlist when format or name changes (module-level watchers)
let watchersInitialized = false

export function usePlaylist() {
  // Set up watchers only once (from the first component setup context)
  if (!watchersInitialized) {
    watchersInitialized = true

    watch(outputFormat, () => {
      if (files.value.length > 0) {
        generatePlaylist()
      }
    })

    watch(playlistName, () => {
      // Only XSPF and CUE embed the playlist name in the output
      if (
        files.value.length > 0 &&
        (outputFormat.value === 'xspf' || outputFormat.value === 'cue')
      ) {
        generatePlaylist()
      }
    })
  }

  return {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    selectedFileIndex,
    isFileSelected,
    selectedCount,
    allSelected,
    someSelected,
    toggleFileSelected,
    setAllSelected,
    addFiles,
    clearFiles,
    removeFile,
    undoRemove,
    clearUndo,
    moveFile,
    sortFiles,
    generatePlaylist,
    savePlaylist,
    analyzeBlob,
    handleSharedFiles,
  }
}
