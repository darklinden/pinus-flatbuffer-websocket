#![allow(dead_code)]

use anyhow::Result;
use sea_orm::*;

use entities::user_login;

use crate::db_util::FromEntTrait;
use crate::dto::user_login_dto::UserLoginDto;

pub struct DbService {}

impl DbService {
    async fn cache_find_by_id(
        rd: &mut redis::aio::ConnectionManager,
        user_id: &i64,
    ) -> Result<Option<UserLoginDto>> {
        let redis_key = UserLoginDto::cache_key_by_id(user_id);
        let dto = redis::Cmd::get(&redis_key)
            .query_async::<_, Option<UserLoginDto>>(rd)
            .await?;
        Ok(dto)
    }

    async fn db_find_by_id<C>(db: &C, user_id: &i64) -> Result<Option<UserLoginDto>>
    where
        C: ConnectionTrait,
    {
        let ent = user_login::Entity::find_by_id(*user_id).one(db).await?;
        match ent {
            Some(ent) => Ok(Some(UserLoginDto::from_ent(&ent))),
            None => Ok(None),
        }
    }

    pub async fn find_by_id<C>(
        rd: &mut redis::aio::ConnectionManager,
        db: &C,
        user_id: &i64,
    ) -> Result<Option<UserLoginDto>>
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

    async fn cache_find_by_account(
        rd: &mut redis::aio::ConnectionManager,
        account: &str,
    ) -> Result<Option<UserLoginDto>> {
        let redis_key = UserLoginDto::cache_key_by_account(account);
        let dto = redis::Cmd::get(&redis_key)
            .query_async::<_, Option<UserLoginDto>>(rd)
            .await?;
        Ok(dto)
    }

    async fn db_find_by_account<C>(db: &C, account: &str) -> Result<Option<UserLoginDto>>
    where
        C: ConnectionTrait,
    {
        let ent = user_login::Entity::find()
            .filter(user_login::Column::Account.eq(account))
            .one(db)
            .await?;
        match ent {
            Some(ent) => Ok(Some(UserLoginDto::from_ent(&ent))),
            None => Ok(None),
        }
    }

    pub async fn find_by_account<C>(
        rd: &mut redis::aio::ConnectionManager,
        db: &C,
        account: &str,
    ) -> Result<Option<UserLoginDto>>
    where
        C: ConnectionTrait,
    {
        // cache
        let dto = Self::cache_find_by_account(rd, account).await?;
        if dto.is_some() {
            return Ok(dto);
        }

        // db
        let dto = Self::db_find_by_account(db, account).await?;
        if let Some(dto) = dto {
            dto.cache_save(rd).await?;
            return Ok(Some(dto));
        }

        Ok(None)
    }
}
