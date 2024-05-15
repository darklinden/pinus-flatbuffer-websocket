use anyhow::Result;

use crate::handlers::handle_data_msg;
use crate::session::WsSessionData;

use super::pkg::{Pkg, PkgBody, PkgType};

pub async fn handle_data(session_data: &WsSessionData, pkg: Pkg) -> Result<Option<Pkg>> {
    // log::debug!("handle {}", PkgType::Data);
    match pkg.content {
        PkgBody::Msg(msg) => Ok(handle_msg(session_data, msg).await),
        _ => {
            log::error!("session recv unknown package content {:?}", pkg.content);
            Ok(Some(Pkg {
                pkg_type: PkgType::Kick,
                content: PkgBody::StrMsg("unknown package type".to_string()),
            }))
        }
    }
}

async fn handle_msg(session_data: &WsSessionData, m: super::msg::Msg) -> Option<Pkg> {
    let route = m.route.clone();
    log::debug!("client msg {:?}", route);
    match handle_data_msg(session_data, m).await {
        Ok(m) => match m {
            Some(m) => {
                log::debug!("server return msg {:?}", route);
                Some(Pkg {
                    pkg_type: PkgType::Data,
                    content: PkgBody::Msg(m),
                })
            }
            None => {
                log::debug!("server return msg None");
                None
            }
        },
        Err(e) => {
            log::error!("handle msg {:?} error: {:?}", route, e);
            Some(Pkg {
                pkg_type: PkgType::Kick,
                content: PkgBody::StrMsg(format!("handle msg error: {:?}", route)),
            })
        }
    }
}
