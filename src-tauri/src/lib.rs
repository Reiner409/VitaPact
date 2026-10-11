/// Thin shell: opens the window and registers the only two plugins VitaPact may use
/// (saving and opening files). All application logic lives in TypeScript.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running VitaPact");
}
