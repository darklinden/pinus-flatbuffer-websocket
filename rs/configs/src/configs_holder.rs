#![allow(dead_code)]

use anyhow::Result;
use arc_swap::ArcSwap;
use futures_util::StreamExt;
use std::{
    ops::Deref,
    sync::{Arc, OnceLock},
};

use utils::constants::REDIS_SUB_CONFIGS_BYTES_REFRESH;
use utils::constants::REDIS_SUB_CONFIGS_DB_REFRESH;

use super::{bytes::BytesConfigsData, db::DBConfigsData};

#[derive(Debug)]
pub struct ConfigsHolder {
    bytes_data: ArcSwap<BytesConfigsData>,
    db_data: ArcSwap<DBConfigsData>,
}

static CONSUMER_INSTANCE: OnceLock<ConfigsHolder> = OnceLock::new();

impl ConfigsHolder {
    pub async fn init(
        rd: actix_web::web::Data<redis::Client>,
        pg: actix_web::web::Data<sea_orm::DatabaseConnection>,
    ) {
        log::info!("Initializing ConfigsHolder...");
        let bytes_config_data = BytesConfigsData::load_all().await.unwrap();
        let db_config_data = DBConfigsData::load_all(pg.get_ref()).await.unwrap();
        CONSUMER_INSTANCE.get_or_init(|| ConfigsHolder {
            bytes_data: ArcSwap::new(Arc::new(bytes_config_data)),
            db_data: ArcSwap::new(Arc::new(db_config_data)),
        });

        tokio::spawn(async move {
            let result = ConfigsHolder::instance()
                .async_subscribe(rd.clone(), pg.clone())
                .await;
            if let Err(err) = result {
                log::error!("Error subscribing to channel: {}", err);
            }
        });
    }

    pub fn instance() -> &'static ConfigsHolder {
        CONSUMER_INSTANCE.get().unwrap()
    }

    pub fn bytes_cfg() -> Arc<BytesConfigsData> {
        Self::instance().bytes_data.load().deref().clone()
    }

    pub fn db_cfg() -> Arc<DBConfigsData> {
        Self::instance().db_data.load().deref().clone()
    }

    async fn async_subscribe(
        &self,
        rd: actix_web::web::Data<redis::Client>,
        pg: actix_web::web::Data<sea_orm::DatabaseConnection>,
    ) -> Result<()> {
        let mut pubsub = rd.get_async_pubsub().await?;

        // 注册订阅 bytes 配置刷新
        pubsub.subscribe(REDIS_SUB_CONFIGS_BYTES_REFRESH).await?;

        // 注册订阅 db 配置刷新
        pubsub.subscribe(REDIS_SUB_CONFIGS_DB_REFRESH).await?;

        // Inside the spawned task, use a loop to continuously process messages
        while let Some(msg) = pubsub.on_message().next().await {
            println!("Received message: {:?}", msg);
            let channel_name = msg.get_channel_name();
            match channel_name {
                REDIS_SUB_CONFIGS_BYTES_REFRESH => {
                    let _json_str = msg.get_payload::<String>().unwrap();

                    let data = BytesConfigsData::load_all().await?;
                    self.bytes_data.swap(Arc::new(data));
                }
                REDIS_SUB_CONFIGS_DB_REFRESH => {
                    let _json_str = msg.get_payload::<String>().unwrap();

                    let data = DBConfigsData::load_all(pg.get_ref()).await?;
                    self.db_data.swap(Arc::new(data));
                }
                _ => {
                    log::warn!("Unknown channel: {:?}", channel_name);
                }
            }
        }

        Ok(())
    }
}
