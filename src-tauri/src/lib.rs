// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use std::sync::Mutex;
use tauri::Emitter;

#[derive(Default)]
struct OpenedFile(Mutex<Option<String>>);

#[tauri::command]
fn take_opened_file(state: tauri::State<OpenedFile>) -> Option<String> {
    state.0.lock().unwrap().take()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OpenedFile::default())
        .setup(|app| {
            #[cfg(not(target_os = "macos"))]
            {
                use std::env;
                let args: Vec<String> = env::args().skip(1).collect();
                if let Some(path) = args.into_iter().next() {
                    if let Some(state) = app.try_state::<OpenedFile>() {
                        *state.0.lock().unwrap() = Some(path.clone());
                    }
                    app.emit("opened-file", path).ok();
                }  
            }
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![take_opened_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
