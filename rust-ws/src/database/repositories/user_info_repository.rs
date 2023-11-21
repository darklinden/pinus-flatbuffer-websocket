use anyhow::Ok;
use anyhow::Result;
use sea_orm::*;

use entities::user_info::ActiveModel;
use entities::user_info::Entity;
use entities::user_info::Model;

use crate::database::dto::user_info_dto::UserInfoDto;

pub struct UserInfoRepository;

#[allow(dead_code)]
impl UserInfoRepository {
    pub async fn find_by_id(db: &DbConn, id: i64) -> Result<Option<Model>> {
        Ok(Entity::find_by_id(id).one(db).await?)
    }

    pub async fn create(db: &DbConn, data: &UserInfoDto) -> Result<ActiveModel> {
        Ok(ActiveModel {
            name: Set(data.name.to_owned()),
            level: Set(data.level),
            last_login_version: Set(data.last_login_version.to_owned()),
            ..Default::default()
        }
        .save(db)
        .await?)
    }

    pub async fn update_by_id(db: &DbConn, data: &UserInfoDto) -> Result<Model> {
        let user: ActiveModel = Entity::find_by_id(data.id.unwrap())
            .one(db)
            .await?
            .ok_or(DbErr::Custom("Cannot find user.".to_owned()))
            .map(Into::into)?;

        Ok(ActiveModel {
            id: user.id,
            name: Set(data.name.to_owned()),
            level: Set(data.level),
            last_login_version: Set(data.last_login_version.to_owned()),
        }
        .update(db)
        .await?)
    }
}
