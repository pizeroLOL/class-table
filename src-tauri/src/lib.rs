use std::error::Error;

use gtk::traits::{ContainerExt, GtkWindowExt, WidgetExt};
use gtk_layer_shell::{Edge, Layer, LayerShell};
use tauri::{
    App,
    Error::WebviewLabelAlreadyExists,
    Manager, Runtime, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};

fn set_layer_shell<R>(app: &mut App<R>) -> Result<(), Box<dyn Error>>
where
    R: Runtime,
{
    if !gtk_layer_shell::is_supported() {
        return Ok(());
    }
    let main_window = app.get_webview_window("main").ok_or("no main window")?;
    main_window.hide()?;
    let gtk_window = main_window
        .gtk_window()
        .map_err(|e| format!("get window error {e}"))?
        .application()
        .map(|x| gtk::ApplicationWindow::new(&x))
        .ok_or("no gtk window")?;
    gtk_window.hide();
    gtk_window.set_app_paintable(true);
    let vbox = main_window.default_vbox()?;
    main_window
        .gtk_window()
        .map(|x| x.remove(&vbox))
        .inspect(|_| println!("remove ok"))?;
    gtk_window.add(&vbox);
    gtk_window.init_layer_shell();
    gtk_window.set_layer(Layer::Top);
    gtk_window.set_height_request(24);
    // TODO: handle error
    let monitor: i32 = app.available_monitors().unwrap()[0]
        .work_area()
        .size
        .width
        .try_into()
        .unwrap_or(1920);
    println!("{}", monitor);
    gtk_window.set_width_request(monitor - 16i32);
    gtk_window.set_anchor(Edge::Top, true);
    gtk_window.set_layer_shell_margin(Edge::Top, 8);
    gtk_window.set_exclusive_zone(24);
    gtk_window.show_all();
    Ok(())
}

fn setup<R>(app: &mut App<R>) -> Result<(), Box<dyn Error>>
where
    R: Runtime,
{
    // TODO: dev mode
    if cfg!(any(
        target_os = "netbsd",
        target_os = "openbsd",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "linux"
    )) {
        set_layer_shell(app)?;
    }
    let menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?,
            &MenuItem::with_id(app, "settings", "打开设置", true, None::<&str>)?,
        ],
    )?;
    TrayIconBuilder::new()
        .icon(app.default_window_icon().ok_or("No app icon")?.clone())
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "settings" => {
                let settings = app
                    .config()
                    .app
                    .windows
                    .iter()
                    .find(|x| x.label == "settings")
                    .unwrap();
                let window = WebviewWindowBuilder::from_config(app, &settings)
                    .unwrap()
                    .build();
                match window {
                    Ok(_) => Ok(()),
                    Err(WebviewLabelAlreadyExists(label)) => {
                        eprintln!("已经打开了 {label}");
                        Ok(())
                    }
                    Err(e) => Err(e),
                }
                .unwrap();
            }
            _ => {
                eprintln!("unknow event {}", event.id.as_ref())
            }
        })
        .build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(setup)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
