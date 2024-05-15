#![allow(dead_code)]

use anyhow::Result;
use sea_orm::*;

use entities::user_info;

use crate::db_util::{FromEntTrait, SaveDtoTrait};
use crate::dto::user_info_dto::UserInfoDto;

pub struct DbService {}

impl DbService {
    async fn cache_find_by_id(
        rd: &mut redis::aio::ConnectionManager,
        user_id: &i64,
    ) -> Result<Option<UserInfoDto>> {
        let redis_key = UserInfoDto::cache_key_by_id(user_id);
        let dto = redis::Cmd::get(&redis_key)
            .query_async::<_, Option<UserInfoDto>>(rd)
            .await?;
        Ok(dto)
    }

    async fn db_find_by_id<C>(db: &C, id: &i64) -> Result<Option<UserInfoDto>>
    where
        C: ConnectionTrait,
    {
        let ent = user_info::Entity::find_by_id(*id).one(db).await?;
        match ent {
            Some(ent) => Ok(Some(UserInfoDto::from_ent(&ent))),
            None => Ok(None),
        }
    }

    pub async fn find_by_id<C>(
        rd: &mut redis::aio::ConnectionManager,
        db: &C,
        user_id: &i64,
    ) -> Result<Option<UserInfoDto>>
    where
        C: ConnectionTrait,
    {
        // cache
        let dto = Self::cache_find_by_id(rd, user_id).await?;
        if dto.is_some() {
            return Ok(dto);
        }

        // db
        let dto = Self::db_find_by_id(db, user_id).await?;
        if dto.is_some() {
            let dto = dto.unwrap();
            dto.cache_save(rd).await?;
            return Ok(Some(dto));
        }

        Ok(None)
    }
}
