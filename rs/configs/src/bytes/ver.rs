#![allow(dead_code)]

use anyhow::Result;
use serde::Deserialize;
use std::path::Path;

extern crate flatbuffers;

#[macro_markers::mark_config]
#[derive(Debug, Clone, Deserialize)]
pub struct ConfigVersionData {
    md5: String,
    branch: String,
    commit: String,
    time: String,
}

impl ConfigVersionData {
    pub async fn load_data(config_path: &Path) -> Result<Self> {
        let config_path = config_path.join("ver.json");
        log::debug!("loading config {:?} ...", config_path.to_str().unwrap());

        let buff = tokio::fs::read(config_path).await?;
        let data: ConfigVersionData = serde_json::from_slice(&buff)?;

        Ok(data)
    }

    pub fn get_md5(&self) -> &str {
        &self.md5
    }

    pub fn get_branch(&self) -> &str {
        &self.branch
    }

    pub fn get_commit(&self) -> &str {
        &self.commit
    }

    pub fn get_time(&self) -> &str {
        &self.time
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_data() {
        let config_path = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("configs")
            .join("bytes");
        assert!(config_path.exists());

        let data = ConfigVersionData::load_data(&config_path).await.unwrap();
        println!("{:#?}", data);
        // assert!(false);
    }
}
