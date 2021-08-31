#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod dns;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        dns::dns_lookup_txt,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
