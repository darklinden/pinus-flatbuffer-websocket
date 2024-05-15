use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::OnceLock;

use crate::handlers::ROUTE_LIST;
use utils::constants::heartbeat_secs;

use super::pkg::{Pkg, PkgBody, PkgType};

pub async fn handle_handshake(pkg: Pkg) -> Result<Option<Pkg>> {
    log::debug!("handle {}", PkgType::Handshake);

    match pkg.content {
        PkgBody::None | PkgBody::Msg(_) => Ok(Some(Pkg {
            pkg_type: PkgType::Kick,
            content: PkgBody::StrMsg("handshake fail".to_string()),
        })),
        PkgBody::StrMsg(s) => handle_str_msg(s).await,
    }
}

#[derive(Serialize, Deserialize)]
pub struct Sys {
    heartbeat: u16,
    dict: HashMap<String, u16>,
}

#[derive(Serialize, Deserialize)]
pub struct Handshake {
    code: u16,
    sys: Sys,
}

pub fn route_map() -> &'static HashMap<String, u16> {
    static ROUTE_MAP: OnceLock<HashMap<String, u16>> = OnceLock::new();
    ROUTE_MAP.get_or_init(|| {
        let mut map = HashMap::new();
        for (index, item) in ROUTE_LIST.iter().enumerate() {
            map.insert(item.to_string(), index as u16);
        }
        map
    })
}

async fn handle_str_msg(_msg: String) -> Result<Option<Pkg>> {
    log::debug!("handle str {}", _msg);

    let sys = Sys {
        heartbeat: heartbeat_secs() as u16,
        dict: route_map().to_owned(),
    };

    let handshake = Handshake { code: 200, sys };
    let handshake = serde_json::to_string(&handshake)?;

    Ok(Some(Pkg {
        pkg_type: PkgType::Handshake,
        content: PkgBody::StrMsg(handshake),
    }))
}
