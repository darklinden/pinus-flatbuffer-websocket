use actix_web::web::{self, Json};

use super::user_service;
use crate::{
    database::{
        db_util::redis_conn,
        dto::{
            request_user_dto::RequestUserDto,
            response_login_dto::{self, ResponseLoginDto},
        },
    },
    utils::{error::ServerErrorType, jwt, result::ResponseResult},
};

pub async fn register(
    user: Json<RequestUserDto>,
    redis_client: web::Data<redis::Client>,
    pg_conn: web::Data<sea_orm::DatabaseConnection>,
) -> actix_web::Result<Json<ResponseResult<response_login_dto::ResponseLoginDto>>> {
    let user_info: RequestUserDto = user.into_inner();

    log::info!("UserController.register: {:?}", &user_info);

    let mut rd = redis_conn(redis_client).await;
    let result = user_service::register(&mut rd, &pg_conn, &user_info).await;

    if result.is_err() {
        log::info!("UserController.register failed: {:?}", &user_info);
        return Ok(Json(ResponseResult {
            code: result.err().unwrap() as i32,
            data: None,
        }));
    }

    let uid = result.unwrap().id.unwrap();
    let token = jwt::sign(uid);

    Ok(Json(ResponseResult {
        code: ServerErrorType::ERR_SUCCESS as i32,
        data: Some(ResponseLoginDto { token }),
    }))
}

pub async fn login(
    user: Json<RequestUserDto>,
    redis_client: web::Data<redis::Client>,
    pg_conn: web::Data<sea_orm::DatabaseConnection>,
) -> actix_web::Result<Json<ResponseResult<response_login_dto::ResponseLoginDto>>> {
    let user_info: RequestUserDto = user.into_inner();

    log::info!("UserController.login: {:?}", &user_info);

    let mut rd = redis_conn(redis_client).await;
    let result = user_service::login(&mut rd, &pg_conn, &user_info).await;

    if result.is_err() {
        log::info!("UserController.login failed: {:?}", &user_info);
        return Ok(Json(ResponseResult {
            code: result.err().unwrap() as i32,
            data: None,
        }));
    }

    let uid = result.unwrap().id.unwrap();
    let token = jwt::sign(uid);

    Ok(Json(ResponseResult {
        code: ServerErrorType::ERR_SUCCESS as i32,
        data: Some(ResponseLoginDto { token }),
    }))
}
