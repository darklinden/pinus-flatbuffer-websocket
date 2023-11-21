use redis::FromRedisValue;
use serde::{Deserialize, Serialize};

use crate::database::db_util::FromEnt;

use entities::user_info;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserInfoDto {
    pub id: Option<i64>,
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

impl FromEnt<user_info::Model> for UserInfoDto {
    fn from_ent(v: &user_info::Model) -> Self {
        Self {
            id: Some(v.id),
            name: v.name.to_owned(),
            level: v.level,
            last_login_version: v.last_login_version.to_owned(),
        }
    }
}

impl FromEnt<user_info::ActiveModel> for UserInfoDto {
    fn from_ent(v: &user_info::ActiveModel) -> Self {
        Self {
            id: Some(v.id.to_owned().unwrap()),
            name: v.name.to_owned().unwrap(),
            level: v.level.to_owned().unwrap(),
            last_login_version: v.last_login_version.to_owned().unwrap(),
        }
    }
}
