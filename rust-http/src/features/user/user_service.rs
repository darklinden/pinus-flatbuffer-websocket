use actix_web::error;

use crate::database::db_util::FromEnt;
use crate::database::dto::request_user_dto::RequestUserDto;
use crate::database::dto::user_dto::UserDto;
use crate::database::repositories::UserRepository;
use crate::utils::crypto::{check_password, encrypt_password};
use crate::utils::error::ServerErrorType;

pub async fn register(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    dto: &RequestUserDto,
) -> Result<UserDto, ServerErrorType> {
    if dto.account.is_none() || dto.password.is_none() {
        return Result::Err(ServerErrorType::ERR_FAILED);
    }

    let account = dto.account.clone().unwrap();
    let exist_user = account_get_user(rd, pg, &account).await;
    if exist_user.is_ok() {
        return Result::Err(ServerErrorType::ERR_FAILED);
    }

    let password = dto.password.clone().unwrap();
    let encrypt_password = encrypt_password(&password);
    let user = UserRepository::create(
        pg,
        &RequestUserDto {
            account: Some(account),
            password: Some(encrypt_password),
        },
    )
    .await
    .unwrap();

    let user_dto = UserDto::from_ent(&user);

    let _ = save_cache(rd, &user_dto).await;

    Ok(user_dto)
}

pub async fn login(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    dto: &RequestUserDto,
) -> Result<UserDto, ServerErrorType> {
    if dto.account.is_none() || dto.password.is_none() {
        return Result::Err(ServerErrorType::ERR_FAILED);
    }

    let account = dto.account.as_ref().unwrap();
    let exist_user = account_get_user(rd, pg, account).await;
    if exist_user.is_ok() {
        let user = exist_user.unwrap();
        if check_password(
            dto.password.as_ref().unwrap(),
            user.password.as_ref().unwrap(),
        ) {
            return Ok(user);
        }
    }

    Err(ServerErrorType::ERR_FAILED)
}

async fn save_cache(
    rd: &mut redis::aio::ConnectionManager,
    user: &UserDto,
) -> Result<(), redis::RedisError> {
    if user.id.is_none() {
        return Ok(());
    }

    // save account => user
    let account_key = format!("UserEnt:account:{}", &user.account.as_deref().unwrap());
    let id_key = format!("UserEnt:id:{}", &user.id.unwrap());

    let user_json = serde_json::to_string(user).unwrap();

    let _ = redis::Cmd::mset(&[(&account_key, &user_json), (&id_key, &user_json)])
        .query_async::<_, ()>(rd)
        .await
        .map_err(error::ErrorInternalServerError);

    Ok(())
}

pub async fn account_get_user(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    account: &String,
) -> Result<UserDto, ServerErrorType> {
    // key
    let prefix = String::from("UserEnt:account:");
    let key = prefix + account;

    let res = redis::Cmd::get(&key)
        .query_async::<_, Option<UserDto>>(rd)
        .await;

    log::info!("account_get_user: {:?}", res);

    if let Ok(Some(user)) = res {
        return Ok(user);
    }

    // db
    let ent = UserRepository::find_by_account(pg, account).await;
    if ent.is_ok() {
        let model = ent.unwrap();
        if model.is_some() {
            let dto = UserDto::from_ent(&model.unwrap());
            let _ = save_cache(rd, &dto).await;
            return Ok(dto);
        }
    }

    Err(ServerErrorType::ERR_FAILED)
}
