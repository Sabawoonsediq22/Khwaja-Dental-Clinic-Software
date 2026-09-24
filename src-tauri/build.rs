fn main() {
    tauri_build::build();

    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());
    let dest_path = out_dir.join("env_config.rs");

    let dotenv_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");

    let mut client_id = String::new();
    let mut client_secret = String::new();

    if dotenv_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&dotenv_path) {
            for line in content.lines() {
                let line = line.trim();
                if line.is_empty() || line.starts_with('#') {
                    continue;
                }
                if let Some((key, value)) = line.split_once('=') {
                    match key.trim() {
                        "GOOGLE_OAUTH_CLIENT_ID" => {
                            client_id = value.trim().to_string();
                        }
                        "GOOGLE_OAUTH_CLIENT_SECRET" => {
                            client_secret = value.trim().to_string();
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    if client_id.is_empty() {
        println!("cargo:warning=GOOGLE_OAUTH_CLIENT_ID not set. Google Drive features will be unavailable.");
    }

    let content = format!(
        "pub const EMBEDDED_GOOGLE_CLIENT_ID: &str = \"{}\";\n\
         pub const EMBEDDED_GOOGLE_CLIENT_SECRET: &str = \"{}\";\n",
        client_id, client_secret
    );

    std::fs::write(&dest_path, content).unwrap();

    embed_migrations(&out_dir);
}

fn embed_migrations(out_dir: &std::path::Path) {
    println!("cargo:rerun-if-changed=migrations");

    let migrations_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("migrations");
    let mut migrations: Vec<(String, String)> = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&migrations_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map(|ext| ext == "sql").unwrap_or(false) {
                let stem = path
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("")
                    .to_string();
                let version = stem.split('_').next().unwrap_or("").to_string();
                match std::fs::read_to_string(&path) {
                    Ok(sql) => migrations.push((version, sql)),
                    Err(e) => panic!("Failed to read migration {}: {}", path.display(), e),
                }
            }
        }
    }

    migrations.sort_by(|a, b| a.0.cmp(&b.0));

    let mut code = String::from("pub static EMBEDDED_MIGRATIONS: &[(&str, &str)] = &[\n");
    for (version, sql) in &migrations {
        code.push_str(&format!("    ({:?}, {:?}),\n", version, sql));
    }
    code.push_str("];\n");

    std::fs::write(out_dir.join("migrations_embed.rs"), code).unwrap();
}
