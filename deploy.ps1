# ============================================
# Playlist Generator Vue - Deployment Script
# ============================================

# Konfiguration
$LOCAL_PATH = "C:\Users\User\playlist-generator-vue"
$SERVER_USER = "dein_username"
$SERVER_HOST = "dein_server_ip_oder_domain"
$SERVER_PATH = "/var/www/kodinitools.com/playlist_generator"

Write-Host "=== Playlist Generator Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: In das Projekt-Verzeichnis wechseln
Write-Host "[1/4] Wechsle in Projekt-Verzeichnis..." -ForegroundColor Yellow
Set-Location $LOCAL_PATH

# Schritt 2: Dependencies installieren (falls nötig)
Write-Host "[2/4] Installiere Dependencies..." -ForegroundColor Yellow
npm install

# Schritt 3: Production Build erstellen
Write-Host "[3/4] Erstelle Production Build..." -ForegroundColor Yellow
npm run build

# Schritt 4: Auf Server hochladen
Write-Host "[4/4] Lade Dateien auf Server hoch..." -ForegroundColor Yellow

# OPTION A: Mit SCP (benötigt OpenSSH oder PuTTY)
Write-Host "Uploading mit SCP..." -ForegroundColor Green
scp -r dist/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# OPTION B: Mit rsync (falls rsync auf Windows installiert ist)
# Write-Host "Uploading mit rsync..." -ForegroundColor Green
# rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

Write-Host ""
Write-Host "=== Deployment abgeschlossen! ===" -ForegroundColor Green
Write-Host "Die Anwendung ist verfügbar unter: https://kodinitools.com/playlist_generator/" -ForegroundColor Cyan
