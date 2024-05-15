#![allow(dead_code)]

use anyhow::Result;
use std::{collections::HashMap, path::Path};

extern crate flatbuffers;
extern crate protocols;

use protocols::proto::{UserExp, UserExpRowT};

#[macro_markers::mark_config]
#[derive(Debug, Clone)]
pub struct UserExpData {
    pub levels: Vec<i32>,
    pub level_map: HashMap<i32, UserExpRowT>,
}

impl UserExpData {
    pub async fn load_data(config_path: &Path) -> Result<Self> {
        let config_path = config_path.join("UserExp.bytes");
        log::debug!("loading config {:?} ...", config_path.to_str().unwrap());

        let buff = tokio::fs::read(config_path).await?;
        let data = flatbuffers::root::<UserExp>(&buff)?;
        let table = data.unpack();
        let rows = table.rows.unwrap();

        let mut levels = Vec::new();
        let mut level_map = HashMap::new();

        for row in rows.iter() {
            levels.push(row.level);
            level_map.insert(row.level, row.clone());
        }

        levels.sort();
        Ok(UserExpData { levels, level_map })
    }

    pub fn get_levels(&self) -> &Vec<i32> {
        &self.levels
    }

    pub fn get_level_config(&self, level: i32) -> Option<&UserExpRowT> {
        self.level_map.get(&level)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_data() {
        let config_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("bytes");
        println!("{:?}", config_path);
        assert!(config_path.exists());

        let data = UserExpData::load_data(&config_path).await.unwrap();
        println!("{:#?}", data);
        assert!(data.levels.len() > 0);
    }
}
