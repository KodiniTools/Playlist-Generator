import { createPinia, setActivePinia } from 'pinia'

// Eine Pinia-Instanz je Testdatei, wie bisher ein Modul-Singleton je Datei.
// Wird vor dem Import der Testdatei aktiv, damit auch Aufrufe auf Modulebene
// (z. B. `const p = usePlaylist()` im describe-Block) einen Store bekommen.
setActivePinia(createPinia())

// jsdom kennt Blob.prototype.arrayBuffer nicht (alle Zielbrowser schon).
if (typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function (this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}

// jsdom kennt auch Blob.prototype.stream nicht.
if (typeof Blob.prototype.stream !== 'function') {
  Blob.prototype.stream = function (this: Blob) {
    const buffer = this.arrayBuffer()
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new Uint8Array(await buffer))
        controller.close()
      },
    }) as ReturnType<Blob['stream']>
  }
}
