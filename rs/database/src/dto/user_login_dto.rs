#![allow(dead_code)]

use redis::FromRedisValue;
use sea_orm::*;
use serde::{Deserialize, Serialize};

use crate::db_util::{FromEntTrait, ToEntTrait};

use entities::user_login;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct UserLoginDto {
    pub id: Option<i64>,
    pub account: Option<String>,
    pub password: Option<String>,
    pub role: i32,
}

impl FromRedisValue for UserLoginDto {
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

impl FromEntTrait<user_login::Model> for UserLoginDto {
    fn from_ent(v: &user_login::Model) -> Self {
        Self {
            id: Some(v.id),
            account: v.account.to_owned(),
            password: v.password.to_owned(),
            role: v.role,
        }
    }
}

impl ToEntTrait<user_login::ActiveModel> for UserLoginDto {
    fn to_ent(&self) -> user_login::ActiveModel {
        let mut ent = user_login::ActiveModel {
            account: Set(self.account.to_owned()),
            password: Set(self.password.to_owned()),
            role: Set(self.role),
            ..Default::default()
        };

        if let Some(id) = self.id {
            ent.id = Set(id);
        }

        ent
    }
}

// SaveDtoTrait
impl UserLoginDto {
    pub async fn db_save<C>(&mut self, db: &C) -> anyhow::Result<()>
    where
        C: sea_orm::ConnectionTrait,
    {
        let ent = self.to_ent();
        let result = user_login::Entity::insert(ent)
            .on_conflict(
                sea_query::OnConflict::column(user_login::Column::Id)
                    .update_columns([
                        // user_login::Column::Id,
                        user_login::Column::Account,
                        user_login::Column::Password,
                        user_login::Column::Role,
                    ])
                    .to_owned(),
            )
            .exec(db)
            .await?;

        self.id = Some(result.last_insert_id);

        Ok(())
    }

    pub fn cache_key_by_id(user_id: &i64) -> String {
        format!("UserLoginDto:user_id:{}", user_id)
    }

    pub fn cache_key_by_account(account: &str) -> String {
        format!("UserLoginDto:account:{}", account)
    }

    pub async fn cache_save(&self, rd: &mut redis::aio::ConnectionManager) -> anyhow::Result<bool> {
        if self.id.is_none() || self.account.is_none() {
            return Ok(false);
        }

        let id_key = Self::cache_key_by_id(&self.id.unwrap());
        let account_key = Self::cache_key_by_account(self.account.as_deref().unwrap());
        let value = serde_json::to_string(self)?;

        let _ = redis::pipe()
            .atomic()
            .set(&id_key, value.clone())
            .ignore()
            .set(&account_key, value.clone())
            .ignore()
            .query_async::<_, String>(rd)
            .await?;

        Ok(true)
    }

    pub async fn save<C>(
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

    pub fn cache_pipeline_save(&self, pipe: &mut redis::Pipeline) -> bool {
        if self.id.is_none() || self.account.is_none() {
            return false;
        }

        let id_key = Self::cache_key_by_id(&self.id.unwrap());
        let account_key = Self::cache_key_by_account(self.account.as_deref().unwrap());
        let value = serde_json::to_string(self).unwrap();

        pipe.set(&id_key, value.clone())
            .ignore()
            .set(&account_key, value.clone())
            .ignore();

        true
    }
}
