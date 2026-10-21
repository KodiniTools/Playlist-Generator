import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { enforceFavicon, faviconUrl } from '../favicon'

const ROOT = resolve(__dirname, '../../..')
const BASE = '/playlist_generator/'
const OWN = new URL(faviconUrl(BASE), document.baseURI).href

/** Alle Links, die ein Browser als Favicon verwenden könnte. */
const iconLinks = () =>
  Array.from(document.querySelectorAll('link')).filter((link) =>
    /(^|\s)(icon|mask-icon)(\s|$)/i.test(link.rel),
  )

/** Favicon-Kandidaten als `rel href`, zum Vergleich mit ONLY_OWN. */
const icons = () => iconLinks().map((link) => `${link.rel} ${link.href}`)
const ONLY_OWN = [`icon ${OWN}`]

/** MutationObserver-Callbacks laufen als Microtask. */
const flush = () => new Promise((done) => setTimeout(done))

function addLink(rel: string, href: string, parent: Element = document.head) {
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  parent.appendChild(link)
  return link
}

describe('faviconUrl', () => {
  it('hängt favicon.ico an den Basispfad an', () => {
    expect(faviconUrl('/playlist_generator/')).toBe('/playlist_generator/favicon.ico')
    expect(faviconUrl('/playlist_generator')).toBe('/playlist_generator/favicon.ico')
    expect(faviconUrl('/')).toBe('/favicon.ico')
  })
})

describe('enforceFavicon', () => {
  let stop: () => void = () => undefined

  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })
  afterEach(() => stop())

  it('legt den eigenen Link an, wenn keiner existiert', () => {
    stop = enforceFavicon(BASE)
    expect(icons()).toEqual(ONLY_OWN)
  })

  it('entfernt vorhandene fremde Icons und lässt Touch-Icon und Manifest stehen', () => {
    addLink('icon', '/icons/icon.svg')
    addLink('shortcut icon', '/favicon.ico')
    addLink('mask-icon', '/safari.svg')
    addLink('icon', '/partials/brand.png', document.body)
    addLink('apple-touch-icon', '/icons/apple-touch-icon.png')
    addLink('manifest', '/manifest.webmanifest')

    stop = enforceFavicon(BASE)

    expect(icons()).toEqual(ONLY_OWN)
    expect(document.querySelector('link[rel="apple-touch-icon"]')).not.toBeNull()
    expect(document.querySelector('link[rel="manifest"]')).not.toBeNull()
  })

  it('behält einen bereits korrekten Link (aus index.html) und dupliziert ihn nicht', () => {
    const existing = addLink('icon', faviconUrl(BASE))
    stop = enforceFavicon(BASE)
    expect(icons()).toEqual(ONLY_OWN)
    expect(iconLinks()[0]).toBe(existing)
  })

  it('entfernt später injizierte Icons (z. B. aus SSI-Partials)', async () => {
    stop = enforceFavicon(BASE)
    addLink('icon', 'https://kodinitools.com/favicon.png')
    const wrapper = document.createElement('div')
    wrapper.innerHTML = '<link rel="shortcut icon" href="/other.ico">'
    document.body.appendChild(wrapper)
    await flush()
    expect(icons()).toEqual(ONLY_OWN)
  })

  it('stellt den eigenen Link wieder her, wenn er entfernt oder umgebogen wird', async () => {
    stop = enforceFavicon(BASE)
    iconLinks()[0]!.remove()
    await flush()
    expect(icons()).toEqual(ONLY_OWN)

    iconLinks()[0]!.href = '/fremd.png'
    await flush()
    expect(icons()).toEqual(ONLY_OWN)
  })
})

describe('Favicon-Quellen im Repo', () => {
  it('index.html verlinkt als einziges Favicon /favicon.ico', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8')
    const rels = Array.from(html.matchAll(/<link\b[^>]*>/gi), ([tag]) => tag).filter(
      (tag) => /rel="[^"]*\b(icon|mask-icon)\b[^"]*"/i.test(tag) && !/apple-touch-icon/i.test(tag),
    )
    expect(rels).toHaveLength(1)
    expect(rels[0]).toMatch(/rel="icon"/)
    expect(rels[0]).toMatch(/href="\/favicon\.ico"/)
  })

  it('deploy.sh liefert die favicon.ico aus dem Build aus (nicht ausgeschlossen)', () => {
    const deploy = readFileSync(resolve(ROOT, 'deploy.sh'), 'utf8')
    const keep = deploy.match(/^KEEP=\(([^)]*)\)/m)?.[1] ?? ''
    expect(keep).not.toMatch(/favicon/)
  })
})
