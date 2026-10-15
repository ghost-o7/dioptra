// Kein Konsolenfenster unter Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    dioptra_lib::run()
}
