#!/usr/bin/env bash
#
# deploy-downloads.sh – legt die Windows-Installer der Desktop-App auf dem VPS ab.
#
# Die Download-Seite (/playlist_generator/download) verlinkt
# /playlist_generator/downloads/<Datei>.
# Die Dateien kommen aus dem GitHub-Release (Workflow „Windows-Desktop-App“)
# oder aus einem lokalen Ordner (z. B. das entpackte Artefakt-ZIP).
#
#   sudo ./deploy-downloads.sh                    # neuestes GitHub-Release
#   sudo ./deploy-downloads.sh desktop-v1.0.0     # bestimmtes Release
#   sudo ./deploy-downloads.sh --from-dir ~/playlist-generator-windows   # lokale Dateien
#
# deploy.sh lässt den Ordner downloads/ beim Veröffentlichen unangetastet (KEEP).
#
set -euo pipefail

REPO="${REPO:-KodiniTools/Playlist-Generator}"
DOWNLOAD_DIR="${DOWNLOAD_DIR:-/var/www/kodinitools.com/playlist_generator/downloads}"
WEB_USER="${WEB_USER:-www-data}"
WEB_GROUP="${WEB_GROUP:-www-data}"

# Feste Namen, wie in src/utils/desktopDownloads.ts verlinkt
FILES=(
  Playlist-Generator-Setup-x64.exe
  Playlist-Generator-x64-de-DE.msi
  Playlist-Generator-x64-en-US.msi
)
# Plausibilitätsgrenze: Jede Datei ist rund 2 MB groß (Fehlerseiten sind viel kleiner)
MIN_BYTES=$((500 * 1024))

TAG=""
FROM_DIR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --from-dir) FROM_DIR="${2:?--from-dir benötigt einen Ordner}"; shift ;;
    -h|--help)  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    desktop-v*) TAG="$1" ;;
    *) echo "Unbekannte Option: $1 (siehe --help)" >&2; exit 2 ;;
  esac
  shift
done

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
step() { printf "\n${CYAN}==> %s${NC}\n" "$*"; }
ok()   { printf "${GREEN}  ✓ %s${NC}\n" "$*"; }
die()  { printf "${RED}  ✗ %s${NC}\n" "$*" >&2; exit 1; }

case "$DOWNLOAD_DIR" in
  ""|"/"|"/var"|"/var/www") die "DOWNLOAD_DIR ist unsicher gesetzt: '$DOWNLOAD_DIR'" ;;
esac

mkdir -p "$DOWNLOAD_DIR"
# Zwischenordner im selben Dateisystem: Die Dateien werden erst ersetzt, wenn
# alle drei vollständig da sind (kein halber Stand bei Abbruch).
INCOMING="$(mktemp -d "$DOWNLOAD_DIR/.incoming.XXXXXX")"
trap 'rm -rf "$INCOMING"' EXIT

# Datei aus einem lokalen Ordner suchen: fester Name oder Tauri-Name im Artefakt
find_local() {
  local name="$1" pattern
  case "$name" in
    *Setup-x64.exe) pattern='*-setup.exe' ;;
    *de-DE.msi)     pattern='*de-DE.msi' ;;
    *en-US.msi)     pattern='*en-US.msi' ;;
  esac
  if [ -f "$FROM_DIR/$name" ]; then
    printf '%s\n' "$FROM_DIR/$name"
  else
    find "$FROM_DIR" -type f -name "$pattern" | head -n 1
  fi
}

if [ -n "$FROM_DIR" ]; then
  [ -d "$FROM_DIR" ] || die "Ordner nicht gefunden: $FROM_DIR"
  step "Übernehme Dateien aus $FROM_DIR"
  VERSION="lokal $(date -Is)"
  for name in "${FILES[@]}"; do
    src="$(find_local "$name")"
    [ -n "$src" ] || die "Nicht gefunden in $FROM_DIR: $name"
    cp "$src" "$INCOMING/$name"
    ok "$name  ←  $(basename "$src")"
  done
else
  command -v curl >/dev/null 2>&1 || die "curl fehlt (apt install curl)"
  if [ -n "$TAG" ]; then
    BASE_URL="https://github.com/$REPO/releases/download/$TAG"
    VERSION="$TAG"
  else
    BASE_URL="https://github.com/$REPO/releases/latest/download"
    VERSION="latest $(date -Is)"
  fi
  step "Lade Dateien von $BASE_URL"
  for name in "${FILES[@]}"; do
    curl -fL --retry 3 --progress-bar -o "$INCOMING/$name" "$BASE_URL/$name" ||
      die "Download fehlgeschlagen: $name (gibt es das Release schon?)"
    ok "$name"
  done
fi

step "Prüfe Dateien"
for name in "${FILES[@]}"; do
  size="$(stat -c %s "$INCOMING/$name")"
  [ "$size" -ge "$MIN_BYTES" ] || die "$name ist zu klein ($size Bytes) – abgebrochen, nichts ersetzt"
  ok "$name  $((size / 1024)) KB"
done

step "Veröffentliche nach $DOWNLOAD_DIR"
for name in "${FILES[@]}"; do
  chmod 644 "$INCOMING/$name"
  mv -f "$INCOMING/$name" "$DOWNLOAD_DIR/$name"
done
printf '%s\n' "$VERSION" > "$DOWNLOAD_DIR/VERSION.txt"
chmod 644 "$DOWNLOAD_DIR/VERSION.txt"
chmod 755 "$DOWNLOAD_DIR"
if [ "$(id -u)" -eq 0 ]; then
  chown -R "$WEB_USER:$WEB_GROUP" "$DOWNLOAD_DIR"
fi
ok "Fertig ($VERSION)"
printf "  https://kodinitools.com/playlist_generator/download\n\n"
