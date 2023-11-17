use crate::pinus::protocol::{PkgBody, PACKAGE_TYPE_HANDSHAKE};

use super::protocol::Pkg;

pub async fn handle_heartbeat(pkg: Pkg) -> Pkg {
    log::debug!("session recv data package PACKAGE_TYPE_HEARTBEAT");
    match pkg.content.unwrap() {
        PkgBody::Msg(msg) => handle_msg(msg).await,
        PkgBody::StrMsg(s) => handle_str_msg(s).await,
    }
}

async fn handle_msg(msg: super::protocol::Msg) -> Pkg {
    log::debug!(
        "session recv data package route {}",
        msg.route.to_owned().unwrap().name.unwrap()
    );

    Pkg {
        pkg_type: PACKAGE_TYPE_HANDSHAKE,
        content: Some(PkgBody::StrMsg("hello".to_string())),
    }
}

async fn handle_str_msg(msg: String) -> Pkg {
    log::debug!("session recv data package route {}", msg);

    Pkg {
        pkg_type: PACKAGE_TYPE_HANDSHAKE,
        content: Some(PkgBody::StrMsg("hello".to_string())),
    }
}
