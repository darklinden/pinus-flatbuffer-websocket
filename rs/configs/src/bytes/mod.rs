// @generated
#![allow(dead_code)]
use utils::constants::config_bytes_folder;

pub mod user_exp;
pub mod ver;

#[derive(Debug, Clone)]
pub struct BytesConfigsData {
    pub user_exp_data: user_exp::UserExpData,
    pub config_version_data: ver::ConfigVersionData,
}

impl BytesConfigsData {
    pub async fn load_all() -> anyhow::Result<Self> {
        let config_path = config_bytes_folder();
        let user_exp_data = user_exp::UserExpData::load_data(config_path);
        let config_version_data = ver::ConfigVersionData::load_data(config_path);
        let (
            user_exp_data,
            config_version_data,
        ) = tokio::join!(
            user_exp_data,
            config_version_data,
        );
        Ok(Self {
            user_exp_data: user_exp_data?,
            config_version_data: config_version_data?,
        })
    }
}
