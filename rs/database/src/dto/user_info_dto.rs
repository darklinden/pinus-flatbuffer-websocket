use redis::FromRedisValue;
use sea_orm::*;
use serde::{Deserialize, Serialize};

use crate::db_util::{FromEntTrait, SaveDtoTrait, ToEntTrait};

use entities::user_info;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserInfoDto {
    pub user_id: i64,
    pub name: String,
    pub level: i32,
    pub last_login_version: String,
}

impl FromRedisValue for UserInfoDto {
    fn from_redis_value(v: &redis::Value) -> redis::RedisResult<Self> {
        match v {
            redis::Value::Data(data) => {
                let result: Self = serde_json::from_slice(data).unwrap();
                Ok(result)
            }
            _ => unimplemented!("{:?}", v),
        }
    }
}

impl FromEntTrait<user_info::Model> for UserInfoDto {
    fn from_ent(v: &user_info::Model) -> Self {
        Self {
            user_id: v.user_id,
            name: v.name.to_owned(),
            level: v.level,
            last_login_version: v.last_login_version.to_owned(),
        }
    }
}

impl ToEntTrait<user_info::ActiveModel> for UserInfoDto {
    fn to_ent(&self) -> user_info::ActiveModel {
        user_info::ActiveModel {
            user_id: Set(self.user_id),
            name: Set(self.name.to_owned()),
            level: Set(self.level),
            last_login_version: Set(self.last_login_version.to_owned()),
        }
    }
}

impl SaveDtoTrait for UserInfoDto {
    async fn db_save<C>(&mut self, db: &C) -> anyhow::Result<()>
    where
        C: sea_orm::ConnectionTrait,
    {
        let ent = self.to_ent();
        user_info::Entity::insert(ent)
            .on_conflict(
                sea_query::OnConflict::column(user_info::Column::UserId)
                    .update_columns([
                        // char_inventories::Column::PlayerId,
                        user_info::Column::Name,
                        user_info::Column::Level,
                        user_info::Column::LastLoginVersion,
                    ])
                    .to_owned(),
            )
            .exec(db)
            .await?;

        Ok(())
    }

    fn cache_key_by_id(user_id: &i64) -> String {
        format!("UserInfoDto:user_id:{}", user_id)
    }

    async fn cache_save(&self, rd: &mut redis::aio::ConnectionManager) -> anyhow::Result<bool> {
        let key = Self::cache_key_by_id(&self.user_id);
        let value = serde_json::to_string(self).unwrap();
        let res = redis::Cmd::set(&key, value)
            .query_async::<_, String>(rd)
            .await;

        Ok(res.is_ok())
    }

    async fn save<C>(
        &mut self,
        rd: &mut redis::aio::ConnectionManager,
        pg: &C,
    ) -> anyhow::Result<()>
    where
        C: sea_orm::ConnectionTrait,
    {
        self.db_save(pg).await?;
        self.cache_save(rd).await?;
        Ok(())
    }

    fn cache_pipeline_save(&self, pipe: &mut redis::Pipeline) -> bool {
        let key = Self::cache_key_by_id(&self.user_id);
        let value = serde_json::to_string(self).unwrap();
        pipe.set(&key, value).ignore();
        true
    }
}
