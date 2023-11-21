use anyhow::Result;

use crate::database::db_util::FromEnt;
use crate::database::dto::user_info_dto::UserInfoDto;
use crate::database::repositories::UserInfoRepository;

pub async fn get_user_info_by_id(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    id: i64,
) -> Result<UserInfoDto> {
    // key
    let key: String = format!("UserInfoEnt:id:{}", id);

    let res = redis::Cmd::get(&key)
        .query_async::<_, Option<UserInfoDto>>(rd)
        .await;

    log::debug!("get_user_info_by_id: {:?}", res);

    if res.is_ok() {
        let user = res.unwrap();
        if user.is_some() {
            return Ok(user.unwrap());
        }
    }

    // db
    // find
    let ent = UserInfoRepository::find_by_id(pg, id).await;
    if ent.is_ok() {
        let model = ent.unwrap();
        if model.is_some() {
            let dto = UserInfoDto::from_ent(&model.unwrap());
            let _ = save_cache(rd, &dto).await;
            return Ok(dto);
        }
    }

    // create
    let data = UserInfoDto {
        id: None,
        name: "".to_owned(),
        level: 1,
        last_login_version: "1.0.0".to_owned(),
    };

    let ent = UserInfoRepository::create(pg, &data).await?;
    let dto = UserInfoDto::from_ent(&ent);
    let _ = save_cache(rd, &dto).await;

    Ok(dto)
}

async fn save_cache(
    rd: &mut redis::aio::ConnectionManager,
    user_info: &UserInfoDto,
) -> Result<(), redis::RedisError> {
    if user_info.id.is_none() {
        return Ok(());
    }

    // save account => user
    let id_key = format!("UserInfoEnt:id:{}", user_info.id.unwrap());

    let user_json = serde_json::to_string(user_info).unwrap();

    let _ = redis::Cmd::set(&id_key, &user_json)
        .query_async::<_, ()>(rd)
        .await?;

    Ok(())
}
