// Dioptra - Desktop-Hülle. Lädt die Web-App aus dem Ordner app/ und stellt Dateidialoge bereit
// (Sicherung speichern, Sicherung einlesen). Alles andere läuft in der Web-App.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("Dioptra konnte nicht gestartet werden");
}
