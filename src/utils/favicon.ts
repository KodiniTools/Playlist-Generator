/**
 * Favicon-Schutz: Die App zeigt wie alle KodiniTools-Apps ausschließlich das
 * Site-Favicon `https://kodinitools.com/favicon.ico` (liegt im Web-Root des
 * Servers, nicht im Repo). Andere Icon-Links (z. B. aus den SSI-Partials oder
 * von Skripten nachgeladen) werden entfernt, ein entfernter oder umgebogener
 * Link wird ersetzt.
 * Apple-Touch-Icon und Manifest-Icons (PWA) sind keine Favicons und bleiben.
 */
const ICON_REL = /(^|\s)(icon|mask-icon)(\s|$)/i

/** Wurzelpfad der Site: dort liegt das gemeinsame Favicon aller KodiniTools-Apps. */
export const SITE_ROOT = '/'

/** URL der Favicon-Datei unter einem Basispfad, z. B. faviconUrl(SITE_ROOT) → '/favicon.ico'. */
export function faviconUrl(base: string): string {
  return `${base.replace(/\/?$/, '/')}favicon.ico`
}

function isIconLink(node: Node): node is HTMLLinkElement {
  return node instanceof HTMLLinkElement && ICON_REL.test(node.rel)
}

function touchesLink(node: Node): boolean {
  return isIconLink(node) || (node instanceof Element && node.querySelector('link') !== null)
}

/**
 * Setzt genau einen `<link rel="icon">` auf die favicon.ico unter `base` und hält
 * diesen Zustand per MutationObserver. Gibt eine Funktion zum Beenden zurück.
 */
export function enforceFavicon(base: string, doc: Document = document): () => void {
  const href = new URL(faviconUrl(base), doc.baseURI).href

  const apply = () => {
    let own: HTMLLinkElement | null = null
    for (const link of Array.from(doc.querySelectorAll('link'))) {
      if (!isIconLink(link)) continue
      if (!own && link.rel.trim().toLowerCase() === 'icon' && link.href === href) own = link
      else link.remove()
    }
    if (!own) {
      own = doc.createElement('link')
      own.rel = 'icon'
      own.href = href
      own.setAttribute('sizes', 'any')
      doc.head.appendChild(own)
    }
  }

  apply()
  const observer = new MutationObserver((records) => {
    const relevant = records.some((record) =>
      record.type === 'attributes'
        ? record.target instanceof HTMLLinkElement
        : Array.from(record.addedNodes).some(touchesLink) ||
          Array.from(record.removedNodes).some(touchesLink),
    )
    if (relevant) apply()
  })
  observer.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['rel', 'href'],
  })
  return () => observer.disconnect()
}
