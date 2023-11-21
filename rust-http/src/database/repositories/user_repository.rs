use anyhow::{Ok, Result};
use sea_orm::*;

use crate::database::dto::request_user_dto::RequestUserDto;
use entities::user;
use entities::user::Entity as User;

pub struct UserRepository;

#[allow(dead_code)]
impl UserRepository {
    pub async fn find_by_id(db: &DbConn, id: i64) -> Result<Option<user::Model>> {
        Ok(User::find_by_id(id).one(db).await?)
    }

    pub async fn find_by_account(db: &DbConn, account: &str) -> Result<Option<user::Model>> {
        Ok(User::find()
            .filter(user::Column::Account.contains(account))
            .one(db)
            .await?)
    }

    pub async fn create(db: &DbConn, data: &RequestUserDto) -> Result<user::ActiveModel> {
        Ok(user::ActiveModel {
            account: Set(data.account.to_owned()),
            password: Set(data.password.to_owned()),
            token_iat_limit: Set(0),
            ..Default::default()
        }
        .save(db)
        .await?)
    }

    pub async fn update_by_id(db: &DbConn, id: i64, form_data: user::Model) -> Result<user::Model> {
        let user: user::ActiveModel = User::find_by_id(id)
            .one(db)
            .await?
            .ok_or(DbErr::Custom("Cannot find user.".to_owned()))
            .map(Into::into)?;

        Ok(user::ActiveModel {
            id: user.id,
            account: Set(form_data.account.to_owned()),
            password: Set(form_data.password.to_owned()),
            token_iat_limit: Set(form_data.token_iat_limit),
        }
        .update(db)
        .await?)
    }

    pub async fn delete(db: &DbConn, id: i64) -> Result<DeleteResult> {
        let user: user::ActiveModel = User::find_by_id(id)
            .one(db)
            .await?
            .ok_or(DbErr::Custom("Cannot find user.".to_owned()))
            .map(Into::into)?;

        Ok(user.delete(db).await?)
    }
}
