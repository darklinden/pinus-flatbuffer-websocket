use anyhow::Result;

use crate::session::WsSessionData;

use super::{
    handle_data::handle_data,
    handle_handshake::handle_handshake,
    handle_handshake_ack::handle_handshake_ack,
    handle_heartbeat::handle_heartbeat,
    pkg::{Pkg, PkgBody, PkgType},
};

pub async fn handle_pkgs(session_data: WsSessionData, pkgs: Vec<Pkg>) -> Vec<Pkg> {
    let mut result = Vec::new();
    for pkg in pkgs {
        let r = handle_pkg(&session_data, pkg).await;
        if let Ok(Some(pkg)) = r {
            result.push(pkg);
        }
    }
    result
}

pub async fn handle_pkg(session_data: &WsSessionData, pkg: Pkg) -> Result<Option<Pkg>> {
    match pkg.pkg_type {
        PkgType::Handshake => handle_handshake(pkg).await,
        PkgType::HandshakeAck => handle_handshake_ack(pkg).await,
        PkgType::Heartbeat => handle_heartbeat(pkg).await,
        PkgType::Data => handle_data(session_data, pkg).await,
        _ => {
            log::error!("session recv unknown package type {}", pkg.pkg_type);
            Ok(Some(Pkg {
                pkg_type: PkgType::Kick,
                content: PkgBody::StrMsg("unknown package type".to_string()),
            }))
        }
    }
}
