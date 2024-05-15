#![allow(dead_code)]

use std::sync::OnceLock;

use super::env_config::{get_config, ConfigKeys};

// Redis 订阅配置刷新
pub const REDIS_SUB_CONFIGS_BYTES_REFRESH: &str = "subscribe.configs.bytes.refresh";
pub const REDIS_SUB_CONFIGS_DB_REFRESH: &str = "subscribe.configs.database.refresh";

pub fn jwt_expire_time() -> u64 {
    static JWT_EXPIRE_TIME: OnceLock<u64> = OnceLock::new();
    *JWT_EXPIRE_TIME.get_or_init(|| get_config::<u64>(ConfigKeys::JWT_EXPIRATION_TIME).unwrap())
}

pub fn heartbeat_secs() -> u64 {
    static HEARTBEAT_INTERVAL: OnceLock<u64> = OnceLock::new();
    *HEARTBEAT_INTERVAL.get_or_init(|| {
        let mut hb = get_config::<i64>(ConfigKeys::WS_HEARTBEAT).unwrap();
        if hb <= 0 {
            hb = 0
        };
        hb as u64
    })
}

pub fn exe_folder() -> &'static std::path::PathBuf {
    static EXE_FOLDER: OnceLock<std::path::PathBuf> = OnceLock::new();
    EXE_FOLDER.get_or_init(|| {
        let mut path = std::env::current_exe().unwrap();
        path.pop();
        if path.ends_with("deps") {
            path.pop();
        }
        path
    })
}

pub fn config_bytes_folder() -> &'static std::path::PathBuf {
    static CONFIG_BYTES_FOLDER: OnceLock<std::path::PathBuf> = OnceLock::new();
    CONFIG_BYTES_FOLDER.get_or_init(|| {
        let prj_folder_str = env!("CARGO_MANIFEST_DIR").to_string();
        let mut prj_folder: Option<std::path::PathBuf> = None;
        if !prj_folder_str.is_empty() {
            let p = std::path::Path::new(&prj_folder_str);
            if p.exists() && p.is_dir() {
                prj_folder = Some(p.to_path_buf())
            }
        }

        if prj_folder.is_none() {
            let exe_folder = exe_folder();
            prj_folder =
                if exe_folder.ends_with("target/debug") || exe_folder.ends_with("target/release") {
                    Some(exe_folder.parent().unwrap().parent().unwrap().to_path_buf())
                } else {
                    Some(exe_folder.to_owned())
                }
        };

        let prj_folder = prj_folder.unwrap();

        let config_bytes_folder = prj_folder.join("configs").join("bytes");
        log::debug!("config_bytes_folder: {:?}", config_bytes_folder);
        config_bytes_folder
    })
}
