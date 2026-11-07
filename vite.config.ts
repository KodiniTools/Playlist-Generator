import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * Desktop-Build (Windows-App, src-tauri/, siehe DESKTOP.md): `vite build --mode desktop`.
 * Die App liegt dort im Wurzelpfad von http://tauri.localhost und wird nach
 * dist-desktop/ gebaut, damit dist/ (Web-Deploy per deploy.sh) unberührt bleibt.
 */
const DESKTOP_MODE = 'desktop'

/**
 * Nur Desktop: Was in index.html vom Webserver kommt, gibt es in der App nicht.
 * Entfernt die SSI-Includes (Navigation, Footer, Cookie-Banner), das
 * FontAwesome-CSS der Server-Navigation und das PWA-Manifest.
 */
function desktopHtml(): Plugin {
  return {
    name: 'playlist-generator:desktop-html',
    transformIndexHtml(html) {
      return html
        .replace(/[ \t]*<!--#include virtual="[^"]*" -->\n?/g, '')
        .replace(/[ \t]*<link rel="stylesheet" href="\/fontawesome\/[^"]*" \/>\n?/g, '')
        .replace(/[ \t]*<link rel="manifest" href="[^"]*" \/>\n?/g, '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const desktop = mode === DESKTOP_MODE
  return {
    base: desktop ? '/' : '/playlist_generator/',
    plugins: [vue(), tailwindcss(), vueDevTools(), ...(desktop ? [desktopHtml()] : [])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    ...(desktop ? { build: { outDir: 'dist-desktop' } } : {}),
  }
})
