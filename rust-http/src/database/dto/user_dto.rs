use redis::FromRedisValue;
use serde::{Deserialize, Serialize};

use crate::database::db_util::FromEnt;

use entities::user;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserDto {
    pub id: Option<i64>,
    pub account: Option<String>,
    pub password: Option<String>,
    pub token_iat_limit: i64, // token有效期
}

impl FromRedisValue for UserDto {
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

impl FromEnt<user::Model> for UserDto {
    fn from_ent(v: &user::Model) -> Self {
        Self {
            id: Some(v.id),
            account: v.account.clone(),
            password: v.password.clone(),
            token_iat_limit: v.token_iat_limit,
        }
    }
}

impl FromEnt<user::ActiveModel> for UserDto {
    fn from_ent(v: &user::ActiveModel) -> Self {
        Self {
            id: Some(v.id.clone().unwrap()),
            account: v.account.clone().unwrap(),
            password: v.password.clone().unwrap(),
            token_iat_limit: v.token_iat_limit.clone().unwrap(),
        }
    }
}
