import { createPinia, setActivePinia } from 'pinia'

// Eine Pinia-Instanz je Testdatei, wie bisher ein Modul-Singleton je Datei.
// Wird vor dem Import der Testdatei aktiv, damit auch Aufrufe auf Modulebene
// (z. B. `const p = usePlaylist()` im describe-Block) einen Store bekommen.
setActivePinia(createPinia())
