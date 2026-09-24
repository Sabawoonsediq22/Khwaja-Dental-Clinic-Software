// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    install_panic_hook();

    if let Err(err) = tauri_app_lib::run() {
        show_startup_error(&format!("{err}"));
        std::process::exit(1);
    }
}

fn install_panic_hook() {
    let default_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        default_hook(info);
        show_startup_error(&panic_message(info));
    }));
}

fn panic_message(info: &std::panic::PanicHookInfo<'_>) -> String {
    let payload = info.payload();
    if let Some(s) = payload.downcast_ref::<&str>() {
        (*s).to_string()
    } else if let Some(s) = payload.downcast_ref::<String>() {
        s.clone()
    } else {
        "A fatal startup error occurred.".to_string()
    }
}

fn show_startup_error(message: &str) {
    eprintln!("Dentix startup error: {message}");

    if let Ok(log_path) = startup_log_path() {
        let _ = std::fs::write(
            &log_path,
            format!("{}\n{}\n", chrono_like_now(), message),
        );
    }

    #[cfg(windows)]
    windows_message_box(message);
}

fn startup_log_path() -> Result<std::path::PathBuf, std::io::Error> {
    let base = std::env::var_os("LOCALAPPDATA")
        .map(std::path::PathBuf::from)
        .ok_or_else(|| std::io::Error::other("LOCALAPPDATA not set"))?;
    let dir = base.join("com.dentix.desktop");
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join("startup-error.log"))
}

fn chrono_like_now() -> String {
    // Avoid extra deps; local time is enough for a crash log.
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    format!("unix_ts={now}")
}

#[cfg(windows)]
fn windows_message_box(message: &str) {
    #[link(name = "user32")]
    extern "system" {
        fn MessageBoxW(
            hWnd: *mut core::ffi::c_void,
            lpText: *const u16,
            lpCaption: *const u16,
            uType: u32,
        ) -> i32;
    }

    const MB_OK: u32 = 0x00000000;
    const MB_ICONERROR: u32 = 0x00000010;

    let caption: Vec<u16> = "Dentix - Startup Error"
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();
    let text: Vec<u16> = message
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();

    unsafe {
        MessageBoxW(
            core::ptr::null_mut(),
            text.as_ptr(),
            caption.as_ptr(),
            MB_OK | MB_ICONERROR,
        );
    }
}

#[cfg(not(windows))]
fn windows_message_box(_message: &str) {}
