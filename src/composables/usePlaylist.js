import { ref, watch } from 'vue'

export function usePlaylist() {
  const files = ref([])
  const sortOption = ref('alphabetical')
  const playlistName = ref('meine_playliste')
  const outputFormat = ref('m3u')
  const playlistContent = ref('')

  const supportedFormats = ['.mp3', '.wav', '.flac']

  const replaceMode = ref(false)

  const addFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(f =>
      supportedFormats.some(ext => f.name.toLowerCase().endsWith(ext))
    )

    if (replaceMode.value) {
      // Replace mode: clear and add all new files
      files.value = validFiles
      sortFiles()
      generatePlaylist()
      return { added: validFiles.length, skipped: 0 }
    }

    // Append mode: check for duplicates by filename
    const existingNames = new Set(files.value.map(f => f.name.toLowerCase()))
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
    playlistContent.value = ''
  }

  const removeFile = (index) => {
    if (index >= 0 && index < files.value.length) {
      files.value.splice(index, 1)
      generatePlaylist()
    }
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
        const j = Math.floor(Math.random() * (i + 1));
        [files.value[i], files.value[j]] = [files.value[j], files.value[i]]
      }
    }
    generatePlaylist()
  }

  const escapeXml = (str) => {
    return str.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case "'": return '&apos;'
        case '"': return '&quot;'
        default: return char
      }
    })
  }

  const generateM3u = () => {
    let output = "#EXTM3U\n"
    files.value.forEach(file => {
      const title = file.name.replace(/\.[^/.]+$/, "")
      output += `#EXTINF:-1,${title}\n${file.name}\n`
    })
    return output
  }

  const generateJson = () => {
    const playlistData = files.value.map(file => ({
      filename: file.name,
      title: file.name.replace(/\.[^/.]+$/, ""),
      size: file.size
    }))
    return JSON.stringify(playlistData, null, 4)
  }

  const generateXspf = () => {
    const tracks = files.value.map(file => {
      const title = escapeXml(file.name.replace(/\.[^/.]+$/, ""))
      const location = escapeXml(file.name)
      return `    <track>\n      <location>${location}</location>\n      <title>${title}</title>\n    </track>`
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <title>${escapeXml(playlistName.value)}</title>
  <trackList>
${tracks}
  </trackList>
</playlist>`
  }

  const generatePlaylist = () => {
    if (files.value.length === 0) {
      playlistContent.value = ''
      return
    }

    switch (outputFormat.value) {
      case 'm3u':
        playlistContent.value = generateM3u()
        break
      case 'json':
        playlistContent.value = generateJson()
        break
      case 'xspf':
        playlistContent.value = generateXspf()
        break
      default:
        playlistContent.value = "Unsupported format."
    }
  }

  const savePlaylist = async () => {
    if (!playlistContent.value) {
      return false
    }

    const formatDetails = {
      m3u: { ext: '.m3u', mime: 'audio/x-mpegurl' },
      json: { ext: '.json', mime: 'application/json' },
      xspf: { ext: '.xspf', mime: 'application/xspf+xml' }
    }

    const details = formatDetails[outputFormat.value]
    if (!details) return false

    const options = {
      suggestedName: `${playlistName.value}${details.ext}`,
      types: [{
        description: `${outputFormat.value.toUpperCase()} Playlist`,
        accept: { [details.mime]: [details.ext] }
      }]
    }

    try {
      const handle = await window.showSaveFilePicker(options)
      const writable = await handle.createWritable()
      await writable.write(playlistContent.value)
      await writable.close()
      return true
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Could not save the file:", err)
        return false
      }
      return null // User cancelled
    }
  }

  // Auto-regenerate playlist when format or name changes
  watch(outputFormat, () => {
    if (files.value.length > 0) {
      generatePlaylist()
    }
  })

  watch(playlistName, () => {
    // Only XSPF uses the playlist name in the output
    if (files.value.length > 0 && outputFormat.value === 'xspf') {
      generatePlaylist()
    }
  })

  return {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    replaceMode,
    addFiles,
    clearFiles,
    removeFile,
    moveFile,
    sortFiles,
    generatePlaylist,
    savePlaylist
  }
}
