use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::pinus::constants;

use super::handlers::ROUTE_LIST;
use super::pkg::{Pkg, PkgBody, PkgType};

pub async fn handle_handshake(pkg: Pkg) -> Pkg {
    log::debug!("handle {}", PkgType::Handshake);
    match pkg.content {
        PkgBody::None => Pkg {
            pkg_type: PkgType::Kick,
            content: PkgBody::StrMsg("handshake fail".to_string()),
        },
        PkgBody::Msg(msg) => handle_msg(msg).await,
        PkgBody::StrMsg(s) => handle_str_msg(s).await,
    }
}

async fn handle_msg(_msg: super::msg::Msg) -> Pkg {
    log::debug!("handle msg");

    Pkg {
        pkg_type: PkgType::Kick,
        content: PkgBody::StrMsg("handshake fail".to_string()),
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

async fn handle_str_msg(_msg: String) -> Pkg {
    log::debug!("handle str {}", _msg);

    let mut dict = HashMap::new();
    for i in 1..ROUTE_LIST.len() {
        dict.insert(ROUTE_LIST[i].to_string(), i as u16);
    }

    let sys = Sys {
        heartbeat: constants::HEARTBEAT_INTERVAL.as_secs() as u16,
        dict,
    };

    let handshake = Handshake { code: 200, sys };

    Pkg {
        pkg_type: PkgType::Handshake,
        content: PkgBody::StrMsg(serde_json::to_string(&handshake).unwrap()),
    }
}
