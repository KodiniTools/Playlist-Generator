import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { applyPageMeta, canonicalUrl, usePageMeta } from '../usePageMeta'
import { languageFromSearch, useTranslation } from '../useTranslation'

const description = () =>
  document.head.querySelector('meta[name="description"]')?.getAttribute('content')
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')

async function mountAt(path: string) {
  const empty = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'landing', component: empty },
      { path: '/app', name: 'app', component: empty },
      { path: '/faq', name: 'faq', component: empty },
    ],
  })
  await router.push(path)
  const Host = defineComponent({ setup: () => usePageMeta(), render: () => null })
  const wrapper = mount(Host, { global: { plugins: [router] } })
  await nextTick()
  return { router, wrapper }
}

describe('languageFromSearch', () => {
  it('liest de/en aus ?lang= und ignoriert alles andere', () => {
    expect(languageFromSearch('?lang=en')).toBe('en')
    expect(languageFromSearch('?source=x&lang=de')).toBe('de')
    expect(languageFromSearch('?lang=fr')).toBeNull()
    expect(languageFromSearch('')).toBeNull()
  })
})

describe('canonicalUrl', () => {
  it('hängt die Sprache nur an, wenn sie Teil der URL ist', () => {
    expect(canonicalUrl('/faq', null)).toBe('https://kodinitools.com/playlist_generator/faq')
    expect(canonicalUrl('/', 'en')).toBe('https://kodinitools.com/playlist_generator/?lang=en')
  })
})

describe('applyPageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('legt description und canonical an und aktualisiert sie danach', () => {
    applyPageMeta('Titel', 'Text', 'https://a/')
    applyPageMeta('Titel 2', 'Text 2', 'https://b/')
    expect(document.title).toBe('Titel 2')
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(description()).toBe('Text 2')
    expect(canonical()).toBe('https://b/')
  })
})

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    useTranslation().setLanguage('de')
  })

  it('setzt Titel, Beschreibung, canonical und html-lang je Route und Sprache', async () => {
    const { router, wrapper } = await mountAt('/faq')
    expect(document.title).toBe('FAQ – Audio Wiedergabeliste Generator')
    expect(description()).toMatch(/^Antworten zu M3U/)
    expect(canonical()).toBe('https://kodinitools.com/playlist_generator/faq')
    expect(document.documentElement.lang).toBe('de')

    useTranslation().setLanguage('en')
    await nextTick()
    expect(document.title).toBe('FAQ – Audio Playlist Generator')
    expect(description()).toMatch(/^Answers about M3U/)

    await router.push('/app')
    expect(document.title).toBe('Create a Playlist – Audio Playlist Generator')
    expect(canonical()).toBe('https://kodinitools.com/playlist_generator/app')
    wrapper.unmount()
  })

  it('hält ?lang= in der URL beim Sprachwechsel aktuell und nimmt es ins canonical', async () => {
    const { router, wrapper } = await mountAt('/?lang=de')
    expect(canonical()).toBe('https://kodinitools.com/playlist_generator/?lang=de')

    useTranslation().setLanguage('en')
    await nextTick()
    await router.isReady()
    await new Promise((r) => setTimeout(r))
    expect(router.currentRoute.value.query.lang).toBe('en')
    expect(canonical()).toBe('https://kodinitools.com/playlist_generator/?lang=en')
    expect(document.title).toBe('Audio Playlist Generator – Create M3U, PLS, XSPF & JSON')
    wrapper.unmount()
  })
})
