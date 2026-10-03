<template>
  <div class="blog-page">
    <AppHeader />

    <article class="blog-container">
      <!-- German Content -->
      <div v-if="currentLanguage === 'de'" class="blog-content">
        <header class="blog-header">
          <h1>Der ultimative Audio Wiedergabeliste Generator: Alle Funktionen im Detail</h1>
          <p class="blog-subtitle">
            Erstelle professionelle Wiedergabelisten in Sekundenschnelle - direkt im Browser
          </p>
        </header>

        <section class="blog-section">
          <h2>Einleitung</h2>
          <p>
            Musik begleitet uns durch den Alltag - beim Sport, bei der Arbeit oder zum Entspannen.
            Doch wer kennt es nicht: Die eigene Musiksammlung wächst, aber das Erstellen von
            Wiedergabelisten für verschiedene Media Player ist oft umständlich und zeitaufwändig.
            Genau hier setzt der <strong>Audio Wiedergabeliste Generator</strong> an.
          </p>
          <p>
            Dieses moderne Web-Tool ermöglicht es dir, aus deinen lokalen Audiodateien
            professionelle Wiedergabelisten zu erstellen - und das komplett im Browser, ohne
            Installation und ohne dass deine Dateien jemals hochgeladen werden. In diesem
            umfangreichen Artikel stellen wir dir alle Funktionen im Detail vor.
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
            Der Audio Wiedergabeliste Generator unterstützt drei verschiedene
            Wiedergabeliste-Formate, die jeweils für unterschiedliche Anwendungsfälle optimiert
            sind:
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
            M3U-Dateien sind einfache Textdateien, die Verweise auf deine Audiodateien enthalten.
            Sie sind leichtgewichtig und universell kompatibel - perfekt für den alltäglichen
            Gebrauch.
          </p>

          <h3>XSPF-Format</h3>
          <p>
            Das <strong>XSPF-Format</strong> (XML Shareable Wiedergabeliste Format) ist das moderne,
            XML-basierte Wiedergabeliste-Format. Es bietet gegenüber M3U einige Vorteile:
          </p>
          <ul>
            <li>
              <strong>Strukturierte Daten:</strong> Durch die XML-Struktur können zusätzliche
              Metadaten wie Wiedergabeliste-Name und Titel sauber gespeichert werden
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
            Das <strong>JSON-Format</strong> ist besonders für Entwickler und technisch versierte
            Nutzer interessant. Es bietet:
          </p>
          <ul>
            <li>
              <strong>Einfache Integration:</strong> JSON lässt sich problemlos in Web-Anwendungen
              und Skripte einbinden
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
                Das weltweit verbreitetste Audioformat. MP3-Dateien bieten eine gute Balance
                zwischen Dateigröße und Audioqualität und werden von praktisch jedem Gerät
                unterstützt.
              </p>
            </div>
            <div class="format-card">
              <h4>WAV (.wav)</h4>
              <p>
                Das unkomprimierte Audioformat für höchste Qualitätsansprüche. WAV-Dateien sind
                größer, bieten aber verlustfreie Audioqualität - ideal für Audiophile und
                professionelle Anwendungen.
              </p>
            </div>
            <div class="format-card">
              <h4>FLAC (.flac)</h4>
              <p>
                Der goldene Mittelweg: FLAC komprimiert Audiodaten verlustfrei, sodass du
                Speicherplatz sparst, ohne an Qualität einzubüßen. Perfekt für hochwertige
                Musiksammlungen.
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
            Keine Sorge vor doppelten Einträgen! Der Wiedergabeliste Generator erkennt automatisch,
            wenn du eine Datei hinzufügst, die bereits in deiner Liste vorhanden ist. Duplikate
            werden übersprungen und du erhältst eine entsprechende Benachrichtigung.
          </p>

          <h3>Ersetzen oder Hinzufügen</h3>
          <p>
            Du hast die Wahl: Sollen neue Dateien zur bestehenden Liste hinzugefügt werden, oder
            möchtest du die Liste komplett ersetzen? Mit der praktischen Umschaltfunktion wechselst
            du zwischen beiden Modi.
          </p>
        </section>

        <section id="sortierung" class="blog-section">
          <h2>Sortier- und Ordnungsoptionen</h2>
          <p>
            Eine gute Wiedergabeliste lebt von der richtigen Reihenfolge. Der Generator bietet dir
            vier verschiedene Sortieroptionen:
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <h4>Alphabetische Sortierung</h4>
              <p>
                Ordne deine Tracks von A bis Z nach Dateiname. Perfekt für übersichtliche
                Sammlungen.
              </p>
            </div>
            <div class="feature-item">
              <h4>Sortierung nach Datum</h4>
              <p>
                Sortiere deine Dateien nach dem Änderungsdatum - ideal für neue Musikentdeckungen.
              </p>
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
            <li>
              <strong>Einfaches Löschen:</strong> Ein Klick auf das X-Symbol entfernt die Datei
            </li>
            <li>
              <strong>Auswahl und Navigation:</strong> Mit den Pfeiltasten navigierst du durch die
              Liste
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
            Moderne Software sollte sich deinen Vorlieben anpassen - der Wiedergabeliste Generator
            tut genau das.
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
            Ein Klick auf das Sonnen- bzw. Mond-Symbol wechselt zwischen den Modi. Deine Präferenz
            wird automatisch gespeichert.
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
            Die Übersetzung umfasst alle Bereiche: Schaltflächen, Hilfetexte, FAQ,
            Benachrichtigungen und Fehlermeldungen.
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
          <p>
            Ob am Desktop, Tablet oder Smartphone - der Wiedergabeliste Generator passt sich an.
          </p>
          <ul>
            <li>
              <strong>Desktop-Optimiert:</strong> Zwei-Spalten-Layout für effizientes Arbeiten
            </li>
            <li>
              <strong>Tablet-freundlich:</strong> Intelligenter Wechsel zu einer einzelnen Spalte
            </li>
            <li><strong>Mobil-optimiert:</strong> Touch-optimierte Bedienelemente</li>
          </ul>
        </section>

        <section class="blog-section conclusion">
          <h2>Fazit</h2>
          <p>
            Der <strong>Audio Wiedergabeliste Generator</strong> vereint Benutzerfreundlichkeit mit
            umfangreichen Funktionen. Die Kombination aus drei Wiedergabeliste-Formaten, flexiblen
            Sortieroptionen, intuitivem Drag & Drop, Dark und Light Mode, mehrsprachiger Oberfläche
            und absolutem Datenschutz macht ihn zu einem unverzichtbaren Werkzeug für alle
            Musikliebhaber.
          </p>
          <UiButton to="/app" variant="primary" size="lg" class="conclusion__cta">
            Jetzt ausprobieren
          </UiButton>
        </section>
      </div>

      <!-- English Content -->
      <div v-else class="blog-content">
        <header class="blog-header">
          <h1>The Ultimate Audio Playlist Generator: All Features in Detail</h1>
          <p class="blog-subtitle">
            Create professional playlists in seconds - directly in your browser
          </p>
        </header>

        <section class="blog-section">
          <h2>Introduction</h2>
          <p>
            Music accompanies us through everyday life - during sports, at work, or when relaxing.
            But who doesn't know this: Your music collection grows, but creating playlists for
            various media players is often cumbersome and time-consuming. This is exactly where the
            <strong>Audio Playlist Generator</strong> comes in.
          </p>
          <p>
            This modern web tool allows you to create professional playlists from your local audio
            files - completely in the browser, without installation and without your files ever
            being uploaded. In this comprehensive article, we present all features in detail.
          </p>
        </section>

        <nav class="table-of-contents">
          <h2>Table of Contents</h2>
          <ol>
            <li><a href="#playlist-formats">Supported Playlist Formats</a></li>
            <li><a href="#audio-formats">Supported Audio Formats</a></li>
            <li><a href="#file-management">File Management and Upload</a></li>
            <li><a href="#sorting">Sorting Options</a></li>
            <li><a href="#file-list">The Interactive File List</a></li>
            <li><a href="#export-en">Playlist Preview and Export</a></li>
            <li><a href="#themes-en">Dark Mode and Light Mode</a></li>
            <li><a href="#languages">Multilingual Support</a></li>
            <li><a href="#shortcuts-en">Keyboard Shortcuts for Power Users</a></li>
            <li><a href="#statistics">Statistics and Overview</a></li>
            <li><a href="#privacy">Privacy and Security</a></li>
            <li><a href="#responsive-en">Responsive Design</a></li>
          </ol>
        </nav>

        <section id="playlist-formats" class="blog-section">
          <h2>Supported Playlist Formats</h2>
          <p>
            The Audio Playlist Generator supports three different playlist formats, each optimized
            for different use cases:
          </p>

          <h3>M3U Format</h3>
          <p>
            The <strong>M3U format</strong> (MP3 URL) is the classic among playlist formats. It is
            supported by almost all media players, including:
          </p>
          <ul>
            <li>VLC Media Player</li>
            <li>Winamp</li>
            <li>Foobar2000</li>
            <li>Windows Media Player</li>
            <li>iTunes</li>
          </ul>
          <p>
            M3U files are simple text files containing references to your audio files. They are
            lightweight and universally compatible - perfect for everyday use.
          </p>

          <h3>XSPF Format</h3>
          <p>
            The <strong>XSPF format</strong> (XML Shareable Playlist Format) is the modern,
            XML-based playlist format. It offers several advantages over M3U:
          </p>
          <ul>
            <li>
              <strong>Structured Data:</strong> The XML structure allows additional metadata like
              playlist name and title to be stored cleanly
            </li>
            <li>
              <strong>Cross-platform:</strong> XSPF was specifically designed for exchange between
              different programs and operating systems
            </li>
            <li>
              <strong>Extensible:</strong> The format can easily be extended with additional
              information
            </li>
          </ul>

          <h3>JSON Format</h3>
          <p>
            The <strong>JSON format</strong> is particularly interesting for developers and
            technically savvy users. It offers:
          </p>
          <ul>
            <li>
              <strong>Easy Integration:</strong> JSON can be easily integrated into web applications
              and scripts
            </li>
            <li>
              <strong>Machine-readable:</strong> Perfect for automated processing and custom
              integrations
            </li>
            <li>
              <strong>Flexibility:</strong> Contains all information structured and easily
              accessible
            </li>
          </ul>
        </section>

        <section id="audio-formats" class="blog-section">
          <h2>Supported Audio Formats</h2>
          <p>The Playlist Generator works with the three most important audio formats:</p>

          <div class="format-cards">
            <div class="format-card">
              <h4>MP3 (.mp3)</h4>
              <p>
                The world's most widely used audio format. MP3 files offer a good balance between
                file size and audio quality and are supported by virtually every device.
              </p>
            </div>
            <div class="format-card">
              <h4>WAV (.wav)</h4>
              <p>
                The uncompressed audio format for highest quality demands. WAV files are larger but
                offer lossless audio quality - ideal for audiophiles and professional applications.
              </p>
            </div>
            <div class="format-card">
              <h4>FLAC (.flac)</h4>
              <p>
                The golden middle ground: FLAC compresses audio data losslessly, so you save storage
                space without sacrificing quality. Perfect for high-quality music collections.
              </p>
            </div>
          </div>
        </section>

        <section id="file-management" class="blog-section">
          <h2>File Management and Upload</h2>
          <p>Adding your audio files is simple and flexible.</p>

          <h3>Drag & Drop</h3>
          <p>
            Simply drag your audio files into the upload area. The generator automatically
            recognizes supported formats and adds them to your list. You can add single files or
            entire folder contents at once.
          </p>

          <h3>Intelligent Duplicate Detection</h3>
          <p>
            No need to worry about duplicate entries! The Playlist Generator automatically detects
            when you add a file that already exists in your list. Duplicates are skipped and you
            receive a corresponding notification.
          </p>

          <h3>Replace or Add</h3>
          <p>
            You have the choice: Should new files be added to the existing list, or do you want to
            replace the list completely? The practical toggle function lets you switch between both
            modes.
          </p>
        </section>

        <section id="sorting" class="blog-section">
          <h2>Sorting Options</h2>
          <p>
            A good playlist lives from the right order. The generator offers four different sorting
            options:
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <h4>Alphabetical Sorting</h4>
              <p>Sort your tracks from A to Z by filename. Perfect for clear collections.</p>
            </div>
            <div class="feature-item">
              <h4>Sort by Date</h4>
              <p>Sort your files by modification date - ideal for new music discoveries.</p>
            </div>
            <div class="feature-item">
              <h4>Random Sorting</h4>
              <p>With one click, all tracks are put in random order.</p>
            </div>
            <div class="feature-item">
              <h4>Manual Sorting</h4>
              <p>Drag individual tracks to the desired position via drag & drop.</p>
            </div>
          </div>
        </section>

        <section id="file-list" class="blog-section">
          <h2>The Interactive File List</h2>
          <p>
            The heart of the application is the modern, canvas-based file list. It has been
            optimized for performance and user-friendliness.
          </p>
          <ul>
            <li><strong>Visual Display:</strong> Each file is clearly displayed with its name</li>
            <li><strong>Easy Deletion:</strong> One click on the X symbol removes the file</li>
            <li>
              <strong>Selection and Navigation:</strong> Use arrow keys to navigate through the list
            </li>
            <li>
              <strong>Smooth Scrolling:</strong> Even with long lists, the application remains
              responsive
            </li>
          </ul>
        </section>

        <section id="export-en" class="blog-section">
          <h2>Playlist Preview and Export</h2>
          <p>Before you save your playlist, you see exactly what you get.</p>
          <ul>
            <li>
              <strong>Live Preview:</strong> Shows in real-time what your finished playlist will
              look like
            </li>
            <li>
              <strong>Copy to Clipboard:</strong> With one click, the entire playlist content is
              copied
            </li>
            <li>
              <strong>Save as File:</strong> The native save dialog opens with a suggested filename
            </li>
            <li><strong>Name Playlist:</strong> Give your playlist a meaningful name</li>
          </ul>
        </section>

        <section id="themes-en" class="blog-section">
          <h2>Dark Mode and Light Mode</h2>
          <p>
            Modern software should adapt to your preferences - the Playlist Generator does exactly
            that.
          </p>

          <h3>Dark Mode (Default)</h3>
          <p>
            The dark mode is easy on the eyes and looks fantastic: Elegant dark background, golden
            accent colors for important elements, perfect for evening hours.
          </p>

          <h3>Light Mode</h3>
          <p>
            For bright work environments: Clean, light background, warm brown accent colors, optimal
            readability in daylight.
          </p>

          <p>
            One click on the sun or moon symbol switches between modes. Your preference is
            automatically saved.
          </p>
        </section>

        <section id="languages" class="blog-section">
          <h2>Multilingual Support</h2>
          <p>The Playlist Generator speaks your language - literally.</p>
          <ul>
            <li><strong>Deutsch</strong> - Complete German user interface</li>
            <li><strong>English</strong> - Complete English interface</li>
          </ul>
          <p>
            The translation covers all areas: buttons, help texts, FAQ, notifications and error
            messages.
          </p>
        </section>

        <section id="shortcuts-en" class="blog-section">
          <h2>Keyboard Shortcuts for Power Users</h2>
          <p>For all who value efficiency:</p>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th>Shortcut</th>
                <th>Function</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd>Ctrl + O</kbd></td>
                <td>Open file selection dialog</td>
              </tr>
              <tr>
                <td><kbd>Ctrl + S</kbd></td>
                <td>Save playlist</td>
              </tr>
              <tr>
                <td><kbd>Ctrl + C</kbd></td>
                <td>Copy playlist to clipboard</td>
              </tr>
              <tr>
                <td><kbd>Ctrl + V</kbd></td>
                <td>Paste audio files from clipboard</td>
              </tr>
              <tr>
                <td><kbd>Delete</kbd></td>
                <td>Delete selected file</td>
              </tr>
              <tr>
                <td><kbd>↑ / ↓</kbd></td>
                <td>Select file</td>
              </tr>
              <tr>
                <td><kbd>Escape</kbd></td>
                <td>Clear selection</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="statistics" class="blog-section">
          <h2>Statistics and Overview</h2>
          <p>The statistics bar gives you an overview at any time:</p>
          <ul>
            <li><strong>Number of Tracks:</strong> How many titles are in your playlist</li>
            <li><strong>Total Size:</strong> The combined file size of all tracks</li>
            <li>
              <strong>Estimated Playtime:</strong> An approximate total playtime of your playlist
            </li>
          </ul>
        </section>

        <section id="privacy" class="blog-section">
          <h2>Privacy and Security</h2>
          <div class="highlight-box">
            <h3>100% Local Processing</h3>
            <p>
              <strong>Your audio files never leave your computer.</strong> All processing takes
              place directly in your browser. No files are uploaded to servers.
            </p>
          </div>
          <ul>
            <li><strong>No Data Collection:</strong> No user accounts, no tracking</li>
            <li><strong>Browser-based Technology:</strong> Uses modern Web APIs locally</li>
            <li><strong>No Internet Required:</strong> Once loaded, works offline too</li>
          </ul>
        </section>

        <section id="responsive-en" class="blog-section">
          <h2>Responsive Design</h2>
          <p>Whether on desktop, tablet or smartphone - the Playlist Generator adapts.</p>
          <ul>
            <li><strong>Desktop-Optimized:</strong> Two-column layout for efficient work</li>
            <li><strong>Tablet-friendly:</strong> Intelligent switch to single column</li>
            <li><strong>Mobile-optimized:</strong> Touch-optimized controls</li>
          </ul>
        </section>

        <section class="blog-section conclusion">
          <h2>Conclusion</h2>
          <p>
            The <strong>Audio Playlist Generator</strong> combines user-friendliness with
            comprehensive features. The combination of three playlist formats, flexible sorting
            options, intuitive drag & drop, dark and light mode, multilingual interface, and
            absolute privacy makes it an indispensable tool for all music lovers.
          </p>
          <UiButton to="/app" variant="primary" size="lg" class="conclusion__cta">
            Try it now
          </UiButton>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../composables/useTranslation'
  import AppHeader from '../components/AppHeader.vue'
  import { UiButton } from '../components/ui'

  const { currentLanguage } = useTranslation()
</script>

<style scoped>
  .blog-page {
    min-height: 100vh;
    background: var(--ds-surface-0);
    color: var(--ds-text);
  }

  .blog-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--ds-space-16) var(--ds-gutter);
  }

  .blog-header {
    margin-bottom: var(--ds-space-10);
    padding-bottom: var(--ds-space-8);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    text-align: center;
  }

  .blog-header h1 {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-3xl);
    font-weight: var(--ds-weight-bold);
    line-height: var(--ds-leading-tight);
    letter-spacing: var(--ds-tracking-tight);
    color: var(--ds-text);
  }

  .blog-subtitle {
    margin: 0;
    font-size: var(--ds-text-lg);
    line-height: var(--ds-leading);
    color: var(--ds-text-2);
  }

  /* Inhaltsverzeichnis */
  .table-of-contents {
    margin-bottom: var(--ds-space-10);
    padding: var(--ds-space-5) var(--ds-space-6);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
  }

  .table-of-contents h2 {
    margin: 0 0 var(--ds-space-3);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  .table-of-contents ol {
    columns: 2;
    column-gap: var(--ds-space-6);
    margin: 0;
    padding-left: var(--ds-space-5);
  }

  .table-of-contents li {
    margin-bottom: var(--ds-space-2);
    break-inside: avoid;
    font-size: var(--ds-text-md);
    line-height: var(--ds-leading);
  }

  .table-of-contents a {
    border-radius: var(--ds-radius-sm);
    color: var(--ds-text-2);
    text-decoration: none;
    transition: color var(--ds-duration) var(--ds-ease);
  }

  .table-of-contents a:hover {
    color: var(--ds-text);
    text-decoration: underline;
  }

  .table-of-contents a:focus-visible {
    outline: none;
    box-shadow: var(--ds-focus-ring);
  }

  /* Abschnitte */
  .blog-section {
    margin-bottom: var(--ds-space-12);
  }

  .blog-section h2 {
    margin: 0 0 var(--ds-space-5);
    padding-bottom: var(--ds-space-2);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    font-size: var(--ds-text-2xl);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .blog-section h3 {
    margin: var(--ds-space-6) 0 var(--ds-space-3);
    font-size: var(--ds-text-xl);
    font-weight: var(--ds-weight-semibold);
    line-height: var(--ds-leading-tight);
    color: var(--ds-text);
  }

  .blog-section h4 {
    margin: 0 0 var(--ds-space-2);
    font-size: var(--ds-text-lg);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  .blog-section p {
    margin: 0 0 var(--ds-space-4);
    font-size: var(--ds-text-lg);
    line-height: 1.7;
    color: var(--ds-text-2);
  }

  .blog-section strong {
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  .blog-section a {
    color: var(--ds-link);
  }

  .blog-section ul,
  .blog-section ol {
    margin: 0 0 var(--ds-space-4);
    padding-left: var(--ds-space-6);
    color: var(--ds-text-2);
  }

  .blog-section li {
    margin-bottom: var(--ds-space-2);
    line-height: var(--ds-leading);
  }

  /* Formatkarten */
  .format-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--ds-gap);
    margin: var(--ds-space-6) 0;
  }

  .format-card {
    padding: var(--ds-space-5);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-surface-1);
    transition: border-color var(--ds-duration) var(--ds-ease);
  }

  .format-card:hover {
    border-color: var(--ds-border-strong);
  }

  .format-card h4 {
    color: var(--ds-accent);
  }

  .format-card p {
    margin: 0;
    font-size: var(--ds-text-md);
  }

  /* Feature-Liste */
  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ds-gap);
    margin: var(--ds-space-6) 0;
  }

  .feature-item {
    padding: var(--ds-space-4);
    border-left: 3px solid var(--ds-accent);
    border-radius: 0 var(--ds-radius-md) var(--ds-radius-md) 0;
    background: var(--ds-surface-1);
  }

  .feature-item h4 {
    margin-bottom: var(--ds-space-2);
  }

  .feature-item p {
    margin: 0;
    font-size: var(--ds-text-md);
  }

  /* Tastaturkürzel */
  .shortcuts-table {
    width: 100%;
    margin: var(--ds-space-5) 0;
    border-collapse: collapse;
    font-size: var(--ds-text-md);
  }

  .shortcuts-table th,
  .shortcuts-table td {
    padding: var(--ds-space-3) var(--ds-space-4);
    border-bottom: var(--ds-border-width) solid var(--ds-border);
    text-align: left;
  }

  .shortcuts-table th {
    background: var(--ds-surface-1);
    font-weight: var(--ds-weight-semibold);
    color: var(--ds-text);
  }

  .shortcuts-table td {
    color: var(--ds-text-2);
  }

  .shortcuts-table tr:hover td {
    background: var(--ds-surface-1);
  }

  /* Spiegelt UiKbd, ohne jede Taste einzeln zu komponentisieren. */
  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 calc(var(--ds-space-1) + 2px);
    box-sizing: border-box;
    border: var(--ds-border-width) solid var(--ds-border-strong);
    border-bottom-width: 2px;
    border-radius: var(--ds-radius-sm);
    background: var(--ds-surface-2);
    color: var(--ds-text);
    font-family: inherit;
    font-size: var(--ds-text-xs);
    font-weight: var(--ds-weight-semibold);
    line-height: 1;
    white-space: nowrap;
  }

  .highlight-box {
    margin: var(--ds-space-5) 0;
    padding: var(--ds-space-5);
    border: var(--ds-border-width) solid var(--ds-border);
    border-left: 3px solid var(--ds-success);
    border-radius: 0 var(--ds-radius-md) var(--ds-radius-md) 0;
    background: var(--ds-surface-1);
  }

  .highlight-box h3 {
    margin-top: 0;
    color: var(--ds-success);
  }

  .highlight-box p {
    margin-bottom: 0;
  }

  /* Fazit */
  .conclusion {
    padding: var(--ds-space-10) var(--ds-space-8);
    border: var(--ds-border-width) solid var(--ds-border);
    border-radius: var(--ds-radius-lg);
    background: var(--ds-surface-1);
    text-align: center;
  }

  .conclusion h2 {
    padding-bottom: 0;
    border-bottom: none;
  }

  .conclusion__cta {
    margin-top: var(--ds-space-5);
  }

  @media (max-width: 768px) {
    .blog-container {
      padding: var(--ds-space-10) var(--ds-space-4);
    }

    .blog-header h1 {
      font-size: var(--ds-text-2xl);
    }

    .table-of-contents ol {
      columns: 1;
    }

    .blog-section h2 {
      font-size: var(--ds-text-xl);
    }

    .feature-list {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .blog-container {
      padding: var(--ds-space-6) var(--ds-space-3);
    }

    .blog-header {
      margin-bottom: var(--ds-space-6);
      padding-bottom: var(--ds-space-5);
    }

    .blog-header h1 {
      font-size: var(--ds-text-xl);
    }

    .blog-subtitle {
      font-size: var(--ds-text-md);
    }

    .table-of-contents {
      margin-bottom: var(--ds-space-6);
      padding: var(--ds-space-4);
    }

    .blog-section {
      margin-bottom: var(--ds-space-8);
    }

    .blog-section h3 {
      margin: var(--ds-space-5) 0 var(--ds-space-2);
      font-size: var(--ds-text-lg);
    }

    .blog-section p,
    .blog-section li {
      font-size: var(--ds-text-md);
    }

    .shortcuts-table th,
    .shortcuts-table td {
      padding: var(--ds-space-2);
      font-size: var(--ds-text-sm);
      word-break: break-word;
    }

    .conclusion {
      padding: var(--ds-space-6) var(--ds-space-4);
    }
  }
</style>
