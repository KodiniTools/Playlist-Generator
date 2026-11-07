// Kein Konsolenfenster neben der App (nur im Release-Build)
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! Playlist Generator als Desktop-App: ein Fenster mit der Web-App aus
//! dist-desktop/. Audiodateien werden wie im Browser komplett lokal gelesen
//! und abgespielt. Links nach außen (z. B. kodinitools.com, PayPal, Facebook)
//! öffnen im Standardbrowser statt im App-Fenster.

use tauri::webview::NewWindowResponse;
use tauri::{AppHandle, Url, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

/// Adressen, die zur App selbst gehören und im Fenster bleiben.
fn is_internal(url: &Url) -> bool {
    match url.scheme() {
        "tauri" | "blob" | "data" | "about" => true,
        "http" | "https" => {
            matches!(url.host_str(), Some("tauri.localhost"))
            // Entwicklung (`npm run tauri dev`): Vite-Dev-Server
            || (cfg!(debug_assertions) && matches!(url.host_str(), Some("localhost")))
        }
        _ => false,
    }
}

/// Externe Adresse im Standardbrowser öffnen (nur http/https/mailto).
fn open_external(app: &AppHandle, url: &Url) {
    if matches!(url.scheme(), "http" | "https" | "mailto") {
        if let Err(err) = app.opener().open_url(url.as_str(), None::<&str>) {
            eprintln!("Externer Link nicht geöffnet ({url}): {err}");
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let nav_handle = app.handle().clone();
            let popup_handle = app.handle().clone();
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Playlist Generator")
                .inner_size(1280.0, 840.0)
                .min_inner_size(480.0, 600.0)
                .center()
                // Dateien per Drag & Drop landen in der Ablagezone der Web-App
                // (HTML5-Drop-Events) statt beim nativen Tauri-Handler
                .disable_drag_drop_handler()
                .on_navigation(move |url| {
                    if is_internal(url) {
                        return true;
                    }
                    open_external(&nav_handle, url);
                    false
                })
                // target="_blank" / window.open: kein zweites App-Fenster
                .on_new_window(move |url, _features| {
                    open_external(&popup_handle, &url);
                    NewWindowResponse::Deny
                })
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Playlist Generator konnte nicht gestartet werden");
}
