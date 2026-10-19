<template>
  <div class="blog-content">
    <header class="blog-header">
      <h1>Der ultimative Audio Wiedergabeliste Generator: Alle Funktionen im Detail</h1>
      <p class="blog-subtitle">
        Erstelle professionelle Wiedergabelisten in Sekundenschnelle - direkt im Browser
      </p>
    </header>

    <section class="blog-section">
      <h2>Einleitung</h2>
      <p>
        Musik begleitet uns durch den Alltag - beim Sport, bei der Arbeit oder zum Entspannen. Doch
        wer kennt es nicht: Die eigene Musiksammlung wächst, aber das Erstellen von Wiedergabelisten
        für verschiedene Media Player ist oft umständlich und zeitaufwändig. Genau hier setzt der
        <strong>Audio Wiedergabeliste Generator</strong> an.
      </p>
      <p>
        Dieses moderne Web-Tool ermöglicht es dir, aus deinen lokalen Audiodateien professionelle
        Wiedergabelisten zu erstellen - und das komplett im Browser, ohne Installation und ohne dass
        deine Dateien jemals hochgeladen werden. In diesem umfangreichen Artikel stellen wir dir
        alle Funktionen im Detail vor.
      </p>
    </section>

    <nav class="table-of-contents">
      <h2>Inhaltsverzeichnis</h2>
      <ol>
        <li><a href="#playlist-formate">Unterstützte Wiedergabeliste-Formate</a></li>
        <li><a href="#audio-formate">Unterstützte Audioformate</a></li>
        <li><a href="#dateiverwaltung">Dateiverwaltung und Upload</a></li>
        <li><a href="#sortierung">Sortier- und Ordnungsoptionen</a></li>
        <li><a href="#dateiliste">Die interaktive Dateiliste</a></li>
        <li><a href="#export">Wiedergabeliste-Vorschau und Export</a></li>
        <li><a href="#themes">Dark Mode und Light Mode</a></li>
        <li><a href="#sprachen">Mehrsprachige Unterstützung</a></li>
        <li><a href="#shortcuts">Tastaturkürzel für Power-User</a></li>
        <li><a href="#statistiken">Statistiken und Übersicht</a></li>
        <li><a href="#datenschutz">Datenschutz und Sicherheit</a></li>
        <li><a href="#responsive">Responsives Design</a></li>
      </ol>
    </nav>

    <section id="playlist-formate" class="blog-section">
      <h2>Unterstützte Wiedergabeliste-Formate</h2>
      <p>
        Der Audio Wiedergabeliste Generator unterstützt drei verschiedene Wiedergabeliste-Formate,
        die jeweils für unterschiedliche Anwendungsfälle optimiert sind:
      </p>

      <h3>M3U-Format</h3>
      <p>
        Das <strong>M3U-Format</strong> (MP3 URL) ist der Klassiker unter den
        Wiedergabeliste-Formaten. Es wird von nahezu allen Media Playern unterstützt, darunter:
      </p>
      <ul>
        <li>VLC Media Player</li>
        <li>Winamp</li>
        <li>Foobar2000</li>
        <li>Windows Media Player</li>
        <li>iTunes</li>
      </ul>
      <p>
        M3U-Dateien sind einfache Textdateien, die Verweise auf deine Audiodateien enthalten. Sie
        sind leichtgewichtig und universell kompatibel - perfekt für den alltäglichen Gebrauch.
      </p>

      <h3>XSPF-Format</h3>
      <p>
        Das <strong>XSPF-Format</strong> (XML Shareable Wiedergabeliste Format) ist das moderne,
        XML-basierte Wiedergabeliste-Format. Es bietet gegenüber M3U einige Vorteile:
      </p>
      <ul>
        <li>
          <strong>Strukturierte Daten:</strong> Durch die XML-Struktur können zusätzliche Metadaten
          wie Wiedergabeliste-Name und Titel sauber gespeichert werden
        </li>
        <li>
          <strong>Plattformübergreifend:</strong> XSPF wurde speziell für den Austausch zwischen
          verschiedenen Programmen und Betriebssystemen entwickelt
        </li>
        <li>
          <strong>Erweiterbar:</strong> Das Format kann problemlos um zusätzliche Informationen
          erweitert werden
        </li>
      </ul>

      <h3>JSON-Format</h3>
      <p>
        Das <strong>JSON-Format</strong> ist besonders für Entwickler und technisch versierte Nutzer
        interessant. Es bietet:
      </p>
      <ul>
        <li>
          <strong>Einfache Integration:</strong> JSON lässt sich problemlos in Web-Anwendungen und
          Skripte einbinden
        </li>
        <li>
          <strong>Maschinenlesbar:</strong> Perfekt für automatisierte Verarbeitung und
          Custom-Integrationen
        </li>
        <li>
          <strong>Flexibilität:</strong> Enthält alle Informationen strukturiert und leicht
          zugänglich
        </li>
      </ul>
    </section>

    <section id="audio-formate" class="blog-section">
      <h2>Unterstützte Audioformate</h2>
      <p>Der Wiedergabeliste Generator arbeitet mit den drei wichtigsten Audioformaten:</p>

      <div class="format-cards">
        <div class="format-card">
          <h4>MP3 (.mp3)</h4>
          <p>
            Das weltweit verbreitetste Audioformat. MP3-Dateien bieten eine gute Balance zwischen
            Dateigröße und Audioqualität und werden von praktisch jedem Gerät unterstützt.
          </p>
        </div>
        <div class="format-card">
          <h4>WAV (.wav)</h4>
          <p>
            Das unkomprimierte Audioformat für höchste Qualitätsansprüche. WAV-Dateien sind größer,
            bieten aber verlustfreie Audioqualität - ideal für Audiophile und professionelle
            Anwendungen.
          </p>
        </div>
        <div class="format-card">
          <h4>FLAC (.flac)</h4>
          <p>
            Der goldene Mittelweg: FLAC komprimiert Audiodaten verlustfrei, sodass du Speicherplatz
            sparst, ohne an Qualität einzubüßen. Perfekt für hochwertige Musiksammlungen.
          </p>
        </div>
      </div>
    </section>

    <section id="dateiverwaltung" class="blog-section">
      <h2>Dateiverwaltung und Upload</h2>
      <p>Das Hinzufügen deiner Audiodateien ist denkbar einfach und flexibel gestaltet.</p>

      <h3>Drag & Drop</h3>
      <p>
        Ziehe deine Audiodateien einfach per Drag & Drop in den Upload-Bereich. Der Generator
        erkennt automatisch die unterstützten Formate und fügt sie deiner Liste hinzu. Du kannst
        einzelne Dateien oder ganze Ordnerinhalte auf einmal hinzufügen.
      </p>

      <h3>Intelligente Duplikaterkennung</h3>
      <p>
        Keine Sorge vor doppelten Einträgen! Der Wiedergabeliste Generator erkennt automatisch, wenn
        du eine Datei hinzufügst, die bereits in deiner Liste vorhanden ist. Duplikate werden
        übersprungen und du erhältst eine entsprechende Benachrichtigung.
      </p>

      <h3>Ersetzen oder Hinzufügen</h3>
      <p>
        Du hast die Wahl: Sollen neue Dateien zur bestehenden Liste hinzugefügt werden, oder
        möchtest du die Liste komplett ersetzen? Mit der praktischen Umschaltfunktion wechselst du
        zwischen beiden Modi.
      </p>
    </section>

    <section id="sortierung" class="blog-section">
      <h2>Sortier- und Ordnungsoptionen</h2>
      <p>
        Eine gute Wiedergabeliste lebt von der richtigen Reihenfolge. Der Generator bietet dir vier
        verschiedene Sortieroptionen:
      </p>

      <div class="feature-list">
        <div class="feature-item">
          <h4>Alphabetische Sortierung</h4>
          <p>
            Ordne deine Tracks von A bis Z nach Dateiname. Perfekt für übersichtliche Sammlungen.
          </p>
        </div>
        <div class="feature-item">
          <h4>Sortierung nach Datum</h4>
          <p>Sortiere deine Dateien nach dem Änderungsdatum - ideal für neue Musikentdeckungen.</p>
        </div>
        <div class="feature-item">
          <h4>Zufällige Sortierung</h4>
          <p>Per Klick werden alle Tracks in eine zufällige Reihenfolge gebracht.</p>
        </div>
        <div class="feature-item">
          <h4>Manuelle Sortierung</h4>
          <p>Ziehe einzelne Tracks per Drag & Drop an die gewünschte Position.</p>
        </div>
      </div>
    </section>

    <section id="dateiliste" class="blog-section">
      <h2>Die interaktive Dateiliste</h2>
      <p>
        Das Herzstück der Anwendung ist die moderne, Canvas-basierte Dateiliste. Sie wurde für
        Performance und Benutzerfreundlichkeit optimiert.
      </p>
      <ul>
        <li>
          <strong>Visuelle Darstellung:</strong> Jede Datei wird übersichtlich mit ihrem Namen
          angezeigt
        </li>
        <li><strong>Einfaches Löschen:</strong> Ein Klick auf das X-Symbol entfernt die Datei</li>
        <li>
          <strong>Auswahl und Navigation:</strong> Mit den Pfeiltasten navigierst du durch die Liste
        </li>
        <li>
          <strong>Flüssiges Scrollen:</strong> Auch bei langen Listen bleibt die Anwendung
          reaktionsschnell
        </li>
      </ul>
    </section>

    <section id="export" class="blog-section">
      <h2>Wiedergabeliste-Vorschau und Export</h2>
      <p>Bevor du deine Wiedergabeliste speicherst, siehst du genau, was du bekommst.</p>
      <ul>
        <li>
          <strong>Live-Vorschau:</strong> In Echtzeit wird angezeigt, wie deine fertige
          Wiedergabeliste aussehen wird
        </li>
        <li>
          <strong>In die Zwischenablage kopieren:</strong> Mit einem Klick wird der gesamte
          Wiedergabeliste-Inhalt kopiert
        </li>
        <li>
          <strong>Als Datei speichern:</strong> Der native Speichern-Dialog öffnet sich mit
          vorgeschlagenem Dateinamen
        </li>
        <li>
          <strong>Wiedergabeliste benennen:</strong> Gib deiner Wiedergabeliste einen
          aussagekräftigen Namen
        </li>
      </ul>
    </section>

    <section id="themes" class="blog-section">
      <h2>Dark Mode und Light Mode</h2>
      <p>
        Moderne Software sollte sich deinen Vorlieben anpassen - der Wiedergabeliste Generator tut
        genau das.
      </p>

      <h3>Dark Mode (Standard)</h3>
      <p>
        Der dunkle Modus schont die Augen und sieht dabei fantastisch aus: Eleganter dunkler
        Hintergrund, goldene Akzentfarben für wichtige Elemente, perfekt für Abendstunden.
      </p>

      <h3>Light Mode</h3>
      <p>
        Für helle Arbeitsumgebungen: Sauberer, heller Hintergrund, warme braune Akzentfarben,
        optimale Lesbarkeit bei Tageslicht.
      </p>

      <p>
        Ein Klick auf das Sonnen- bzw. Mond-Symbol wechselt zwischen den Modi. Deine Präferenz wird
        automatisch gespeichert.
      </p>
    </section>

    <section id="sprachen" class="blog-section">
      <h2>Mehrsprachige Unterstützung</h2>
      <p>Der Wiedergabeliste Generator spricht deine Sprache - im wahrsten Sinne des Wortes.</p>
      <ul>
        <li><strong>Deutsch</strong> - Vollständige deutsche Benutzeroberfläche</li>
        <li><strong>English</strong> - Complete English interface</li>
      </ul>
      <p>
        Die Übersetzung umfasst alle Bereiche: Schaltflächen, Hilfetexte, FAQ, Benachrichtigungen
        und Fehlermeldungen.
      </p>
    </section>

    <section id="shortcuts" class="blog-section">
      <h2>Tastaturkürzel für Power-User</h2>
      <p>Für alle, die Effizienz schätzen:</p>
      <table class="shortcuts-table">
        <thead>
          <tr>
            <th>Tastenkombination</th>
            <th>Funktion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><kbd>Strg + O</kbd></td>
            <td>Dateiauswahl-Dialog öffnen</td>
          </tr>
          <tr>
            <td><kbd>Strg + S</kbd></td>
            <td>Wiedergabeliste speichern</td>
          </tr>
          <tr>
            <td><kbd>Strg + C</kbd></td>
            <td>Wiedergabeliste in Zwischenablage kopieren</td>
          </tr>
          <tr>
            <td><kbd>Strg + V</kbd></td>
            <td>Audiodateien aus Zwischenablage einfügen</td>
          </tr>
          <tr>
            <td><kbd>Entf</kbd></td>
            <td>Ausgewählte Datei löschen</td>
          </tr>
          <tr>
            <td><kbd>↑ / ↓</kbd></td>
            <td>Datei auswählen</td>
          </tr>
          <tr>
            <td><kbd>Escape</kbd></td>
            <td>Auswahl aufheben</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section id="statistiken" class="blog-section">
      <h2>Statistiken und Übersicht</h2>
      <p>Die Statistikleiste gibt dir jederzeit einen Überblick:</p>
      <ul>
        <li>
          <strong>Anzahl der Tracks:</strong> Wie viele Titel sich in deiner Wiedergabeliste
          befinden
        </li>
        <li><strong>Gesamtgröße:</strong> Die kombinierte Dateigröße aller Tracks</li>
        <li>
          <strong>Geschätzte Spielzeit:</strong> Eine ungefähre Gesamtspielzeit deiner
          Wiedergabeliste
        </li>
      </ul>
    </section>

    <section id="datenschutz" class="blog-section">
      <h2>Datenschutz und Sicherheit</h2>
      <div class="highlight-box">
        <h3>100% Lokale Verarbeitung</h3>
        <p>
          <strong>Deine Audiodateien verlassen niemals deinen Computer.</strong> Die gesamte
          Verarbeitung findet direkt in deinem Browser statt. Es werden keine Dateien auf Server
          hochgeladen.
        </p>
      </div>
      <ul>
        <li><strong>Keine Datensammlung:</strong> Keine Benutzerkonten, kein Tracking</li>
        <li><strong>Browser-basierte Technologie:</strong> Nutzt moderne Web-APIs lokal</li>
        <li>
          <strong>Kein Internet erforderlich:</strong> Einmal geladen, funktioniert auch offline
        </li>
      </ul>
    </section>

    <section id="responsive" class="blog-section">
      <h2>Responsives Design</h2>
      <p>Ob am Desktop, Tablet oder Smartphone - der Wiedergabeliste Generator passt sich an.</p>
      <ul>
        <li><strong>Desktop-Optimiert:</strong> Zwei-Spalten-Layout für effizientes Arbeiten</li>
        <li><strong>Tablet-freundlich:</strong> Intelligenter Wechsel zu einer einzelnen Spalte</li>
        <li><strong>Mobil-optimiert:</strong> Touch-optimierte Bedienelemente</li>
      </ul>
    </section>

    <section class="blog-section conclusion">
      <h2>Fazit</h2>
      <p>
        Der <strong>Audio Wiedergabeliste Generator</strong> vereint Benutzerfreundlichkeit mit
        umfangreichen Funktionen. Die Kombination aus drei Wiedergabeliste-Formaten, flexiblen
        Sortieroptionen, intuitivem Drag & Drop, Dark und Light Mode, mehrsprachiger Oberfläche und
        absolutem Datenschutz macht ihn zu einem unverzichtbaren Werkzeug für alle Musikliebhaber.
      </p>
      <UiButton to="/app" variant="primary" size="lg" class="conclusion__cta">
        Jetzt ausprobieren
      </UiButton>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { UiButton } from '../ui'
</script>

<style scoped src="./blogArticle.css"></style>
