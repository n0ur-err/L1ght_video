// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
async fn download_video(url: String, output_path: String, quality: String) -> Result<String, String> {
    use std::path::PathBuf;
    
    // Get the project root directory
    // In development, we need to go up from ui/src-tauri/target/debug
    // In production, the script should be bundled or in a known location
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    
    // Try multiple potential locations for main.py
    let mut potential_paths: Vec<PathBuf> = vec![
        current_dir.join("main.py"),                          // Same directory
    ];
    
    if let Some(parent) = current_dir.parent() {
        potential_paths.push(parent.join("main.py"));         // Parent directory (ui/)
        
        if let Some(grandparent) = parent.parent() {
            potential_paths.push(grandparent.join("main.py")); // Grandparent (project root)
            
            if let Some(great) = grandparent.parent() {
                if let Some(great_great) = great.parent() {
                    potential_paths.push(great_great.join("main.py")); // For target/debug location
                }
            }
        }
    }
    
    // Absolute fallback
    potential_paths.push(PathBuf::from("D:/projects/youtube_download/main.py"));
    
    let mut script_path = None;
    for path in &potential_paths {
        if path.exists() {
            script_path = Some(path.clone());
            break;
        }
    }
    
    let script_path = script_path
        .ok_or_else(|| format!("Could not find main.py. Searched in: {:?}", potential_paths))?;

    println!("Using Python script at: {:?}", script_path);
    println!("Downloading: {} to {} with quality: {}", url, output_path, quality);

    // Execute Python script
    let output = Command::new("python")
        .arg(&script_path)
        .arg(&url)
        .arg(&output_path)
        .arg(&quality)
        .output()
        .map_err(|e| format!("Failed to execute Python command: {}. Make sure Python is installed and in PATH.", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    println!("Python stdout: {}", stdout);
    if !stderr.is_empty() {
        println!("Python stderr: {}", stderr);
    }

    if output.status.success() {
        Ok(format!("Download completed! Output: {}", stdout))
    } else {
        Err(format!("Download failed: {}", stderr))
    }
}

#[tauri::command]
async fn open_folder(path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }
    
    Ok(format!("Opened folder: {}", path))
}

#[tauri::command]
async fn open_file_location(file_path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg("/select,")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file location: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-R")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file location: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        use std::path::Path;
        let path = Path::new(&file_path);
        if let Some(parent) = path.parent() {
            Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| format!("Failed to open file location: {}", e))?;
        }
    }
    
    Ok(format!("Opened file location: {}", file_path))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_video, open_folder, open_file_location])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
