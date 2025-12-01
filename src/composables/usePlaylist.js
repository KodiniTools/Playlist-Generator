import { ref } from 'vue'

export function usePlaylist() {
  const files = ref([])
  const sortOption = ref('alphabetical')
  const playlistName = ref('meine_playliste')
  const outputFormat = ref('m3u')
  const playlistContent = ref('')

  const supportedFormats = ['.mp3', '.wav', '.flac']

  const addFiles = (fileList) => {
    files.value = Array.from(fileList).filter(f => 
      supportedFormats.some(ext => f.name.toLowerCase().endsWith(ext))
    )
    sortFiles()
  }

  const clearFiles = () => {
    files.value = []
    playlistContent.value = ''
  }

  const removeFile = (index) => {
    if (index >= 0 && index < files.value.length) {
      files.value.splice(index, 1)
      if (files.value.length === 0) {
        playlistContent.value = ''
      }
    }
  }

  const sortFiles = () => {
    const option = sortOption.value
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

  return {
    files,
    sortOption,
    playlistName,
    outputFormat,
    playlistContent,
    addFiles,
    clearFiles,
    removeFile,
    sortFiles,
    generatePlaylist,
    savePlaylist
  }
}
