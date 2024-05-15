use actix_web::web::{self, Json};

use super::user_service;

use super::req_msgs::{RequestUserMsg, ResponseLoginMsg};

use crate::response_result::ResponseResult;

pub async fn register(
    user: Json<RequestUserMsg>,
    rd: web::Data<redis::Client>,
    pg: web::Data<sea_orm::DatabaseConnection>,
) -> actix_web::Result<Json<ResponseResult<ResponseLoginMsg>>> {
    let user_info: RequestUserMsg = user.into_inner();

    let result: ResponseResult<ResponseLoginMsg> =
        user_service::register(&rd, &pg, &user_info).await.into();

    Ok(Json(result))
}

pub async fn login(
    user: Json<RequestUserMsg>,
    rd: web::Data<redis::Client>,
    pg: web::Data<sea_orm::DatabaseConnection>,
) -> actix_web::Result<Json<ResponseResult<ResponseLoginMsg>>> {
    let user_info: RequestUserMsg = user.into_inner();

    let result: ResponseResult<ResponseLoginMsg> =
        user_service::login(&rd, &pg, &user_info).await.into();

    Ok(Json(result))
}
