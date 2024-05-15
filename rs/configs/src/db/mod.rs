// @generated
#![allow(dead_code)]

pub mod system_mail;

#[derive(Debug, Clone)]
pub struct DBConfigsData {
    pub system_mail: system_mail::SystemMail,
}

impl DBConfigsData {
    pub async fn load_all(pg: &sea_orm::DatabaseConnection) -> anyhow::Result<Self> {
        let system_mail = system_mail::SystemMail::load_data(pg);
        let (
            system_mail,
        ) = tokio::join!(
            system_mail,
        );
        Ok(Self {
            system_mail: system_mail?,
        })
    }
}
