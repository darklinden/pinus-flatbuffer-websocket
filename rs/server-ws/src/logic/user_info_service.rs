use anyhow::Result;
use configs::configs_holder::ConfigsHolder;
use protocols::proto::UserInfoT;
use utils::jwt;

use database::{db_util::SaveDtoTrait, dto::user_info_dto::UserInfoDto, service::user_info_db};

pub struct UserInfoService {}

impl UserInfoService {
    pub async fn get_or_create(
        rd: &mut redis::aio::ConnectionManager,
        pg: &sea_orm::DatabaseConnection,
        user_id: &i64,
    ) -> Result<UserInfoDto> {
        // key
        let dto = user_info_db::DbService::find_by_id(rd, pg, user_id).await?;
        if let Some(dto) = dto {
            return Ok(dto);
        }

        // db create new
        let config_ver = ConfigsHolder::bytes_cfg()
            .config_version_data
            .get_commit()
            .to_owned();
        let mut dto = UserInfoDto {
            user_id: *user_id,
            name: "".to_string(),
            level: 1,
            last_login_version: config_ver,
        };

        dto.save(rd, pg).await?;

        Ok(dto)
    }

    pub async fn user_enter_get_info(
        rd: &mut redis::aio::ConnectionManager,
        pg: &sea_orm::DatabaseConnection,
        token: &str,
    ) -> Result<UserInfoT> {
        let auth = jwt::verify(token)?;
        log::info!("UserInfoService.user_enter_get_info: {:#?} ", auth);

        let user_id = auth.uid;

        let cfg_ver = ConfigsHolder::bytes_cfg()
            .config_version_data
            .get_commit()
            .to_owned();

        // 从 cache 或 db 中获取玩家信息
        let mut user_info_changed = false;
        let mut dto = Self::get_or_create(rd, pg, &user_id).await?;
        log::debug!("user_info: {:#?}", dto);

        if dto.last_login_version != cfg_ver {
            // TODO: 通知其他逻辑信息变更
            dto.last_login_version = cfg_ver;
            user_info_changed = true;
        }

        if user_info_changed {
            dto.save(rd, pg).await?;
        }

        let mut user_info = UserInfoT::default();
        user_info.user_id = dto.user_id;
        user_info.name = Some(dto.name.to_owned());
        user_info.level = dto.level;
        Ok(user_info)
    }
}
