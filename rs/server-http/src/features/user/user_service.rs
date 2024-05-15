use anyhow::{Context, Result};

use database::{dto::user_login_dto::UserLoginDto, service::user_login_db};
use utils::jwt;

use super::req_msgs::{RequestUserMsg, ResponseLoginMsg};

pub async fn register(
    rd: &redis::Client,
    pg: &sea_orm::DatabaseConnection,
    req: &RequestUserMsg,
) -> anyhow::Result<ResponseLoginMsg> {
    log::info!("user_service.register: {:?}", &req);

    let account = req.account.to_owned().unwrap_or_default();
    let password = req.password.to_owned().unwrap_or_default();

    if account.is_empty() || password.is_empty() {
        anyhow::bail!("ERR_FAILED");
    }

    let mut rd = rd.get_connection_manager().await?;
    let exist_user = user_login_db::DbService::find_by_account(&mut rd, pg, &account).await?;
    if exist_user.is_some() {
        anyhow::bail!("User already exists");
    }

    let mut user = UserLoginDto {
        account: Some(account),
        password: Some(password),
        ..Default::default()
    };

    user.db_save(pg).await?;

    let uid = user.id.context("Failed to get user id")?;
    let token = jwt::sign(uid)?;

    Ok(ResponseLoginMsg { token })
}

pub async fn login(
    rd: &redis::Client,
    pg: &sea_orm::DatabaseConnection,
    req: &RequestUserMsg,
) -> Result<ResponseLoginMsg> {
    log::info!("user_service.register: {:?}", &req);

    let account = req.account.to_owned().unwrap_or_default();
    let password = req.password.to_owned().unwrap_or_default();

    if account.is_empty() || password.is_empty() {
        anyhow::bail!("ERR_FAILED");
    }

    let mut rd = rd.get_connection_manager().await?;
    let exist_user = user_login_db::DbService::find_by_account(&mut rd, pg, &account).await?;
    if exist_user.is_none() {
        anyhow::bail!("User not found");
    }

    let user = exist_user.unwrap();

    let uid = user.id.unwrap();
    let token = jwt::sign(uid)?;

    Ok(ResponseLoginMsg { token })
}
