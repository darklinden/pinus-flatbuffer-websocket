#![allow(dead_code)]

use anyhow::Result;
use std::sync::OnceLock;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::env_config::{get_config, ConfigKeys};

// 时区偏移 +8 时区 需要 utc -8 小时偏移
// 凌晨4点 需要 +4 小时偏移
// 设置东八区凌晨4点为一天的开始
const DAY_SEC_OFFSET: i64 = -60 * 60 * 4;

struct TimeManager {
    start_ms: i64,
    start_sec: i64,
    time_scale: f64,
}

impl TimeManager {
    fn new() -> Self {
        let mut time_manager = TimeManager {
            start_ms: -1,
            start_sec: -1,
            time_scale: -1.0,
        };

        let time_scale = get_config::<f64>(ConfigKeys::TIME_SCALE).unwrap_or(-1.0);
        println!("TimeManager using timeScale: {}", time_scale);

        if time_scale > 0_f64 {
            time_manager.start_ms = Self::real_now_ms().unwrap();
            time_manager.start_sec = Self::real_now_sec().unwrap();
            time_manager.time_scale = time_scale;
            println!(
                "TimeManager start_time: {} timeScale: {}",
                time_manager.start_ms, time_manager.time_scale
            );
        } else {
            time_manager.start_ms = -1;
            time_manager.start_sec = -1;
            time_manager.time_scale = -1.0;
            println!("TimeManager no timeScale");
        }

        time_manager
    }

    fn real_now_ms() -> Result<i64> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?;
        Ok(now.as_millis() as i64)
    }

    pub fn real_now_sec() -> Result<i64> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?;
        Ok(now.as_secs() as i64)
    }

    fn time_scale_enabled(&self) -> bool {
        self.start_ms > 0 && self.start_sec > 0 && self.time_scale > 0_f64
    }

    fn now_ms(&self) -> i64 {
        if self.time_scale_enabled() {
            let now = Self::real_now_ms().unwrap();
            let distance = now - self.start_ms;
            self.start_ms + (distance as f64 * self.time_scale) as i64
        } else {
            Self::real_now_ms().unwrap()
        }
    }

    fn now_sec(&self) -> i64 {
        if self.time_scale_enabled() {
            let now = Self::real_now_sec().unwrap();
            let distance = now - self.start_sec;
            self.start_sec + (distance as f64 * self.time_scale) as i64
        } else {
            Self::real_now_sec().unwrap()
        }
    }

    fn today_sec(&self) -> i64 {
        let now_sec = self.now_sec();
        now_sec - (now_sec % 86400) + DAY_SEC_OFFSET
    }

    fn day_sec(&self, day: i64) -> i64 {
        let day_sec = self.today_sec();
        day_sec + (day * 86400)
    }
}

fn time_manager() -> &'static TimeManager {
    static TIME_MANAGER: OnceLock<TimeManager> = OnceLock::new();
    TIME_MANAGER.get_or_init(TimeManager::new)
}

pub fn time_scale_enabled() -> bool {
    time_manager().time_scale_enabled()
}

pub fn now_sec() -> i64 {
    time_manager().now_sec()
}

pub fn now_ms() -> i64 {
    time_manager().now_ms()
}

pub fn day_sec(day: i64) -> i64 {
    time_manager().day_sec(day)
}

pub fn day_sec_base(base: &i64, day: i32) -> i64 {
    base + (day as i64 * 86400)
}
