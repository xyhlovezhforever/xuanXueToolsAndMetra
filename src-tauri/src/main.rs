#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let url = if cfg!(debug_assertions) {
                WebviewUrl::App("index.html".into())
            } else {
                let resources = app.path().resource_dir()?;
                let config_dir = app.path().app_config_dir()?;
                fs::create_dir_all(&config_dir)?;
                let config = config_dir.join("llm.toml");
                if !config.exists() {
                    fs::copy(resources.join("server/llm.example.toml"), &config)?;
                }

                let script = resources.join("server/server.mjs");
                let (mut events, child) = app
                    .shell()
                    .sidecar("node")?
                    .args([script.to_string_lossy().to_string(), "--port".into(), "0".into()])
                    .env("XJZ_STATIC_DIR", resources.join("dist"))
                    .env("XJZ_LLM_CONFIG", config)
                    .env("XJZ_DESKTOP", "1")
                    .spawn()?;

                let (ready_sender, ready_receiver) = std::sync::mpsc::channel();
                std::thread::spawn(move || {
                    let mut output = String::new();
                    while let Some(event) = events.blocking_recv() {
                        match event {
                            CommandEvent::Stdout(bytes) => {
                                output.push_str(&String::from_utf8_lossy(&bytes));
                                while let Some(end) = output.find('\n') {
                                    let line: String = output.drain(..=end).collect();
                                    if let Some(port) = line.trim().strip_prefix("XJZ_READY:") {
                                        if let Ok(port) = port.parse::<u16>() {
                                            let _ = ready_sender.send(port);
                                        }
                                    }
                                }
                            }
                            CommandEvent::Stderr(bytes) => {
                                eprintln!("Desktop API: {}", String::from_utf8_lossy(&bytes));
                            }
                            _ => {}
                        }
                    }
                });

                let port = match ready_receiver.recv_timeout(Duration::from_secs(20)) {
                    Ok(port) => port,
                    Err(error) => {
                        let _ = child.kill();
                        return Err(format!("Desktop API did not start: {error}").into());
                    }
                };
                app.manage(Mutex::new(Some((child, port))));
                WebviewUrl::External(format!("http://127.0.0.1:{port}").parse()?)
            };

            WebviewWindowBuilder::new(app, "main", url)
                .title("小渐知你")
                .inner_size(1280.0, 820.0)
                .min_inner_size(900.0, 620.0)
                .center()
                .build()?;
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("failed to build desktop app")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                if let Some(backend) = app.try_state::<Mutex<Option<(CommandChild, u16)>>>() {
                    if let Some((child, port)) = backend.lock().expect("sidecar lock").take() {
                        if let Ok(address) = format!("127.0.0.1:{port}").parse::<SocketAddr>() {
                            if let Ok(mut stream) = TcpStream::connect_timeout(&address, Duration::from_secs(2)) {
                                let _ = stream.set_read_timeout(Some(Duration::from_secs(3)));
                                let _ = stream.write_all(b"POST /api/desktop/shutdown HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
                                let mut response = [0; 256];
                                let _ = stream.read(&mut response);
                            }
                        }
                        let _ = child.kill();
                    }
                }
            }
        });
}
