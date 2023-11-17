use crate::{
    handlers::HANDSHAKE_RET,
    pinus::protocol::{PkgBody, PACKAGE_TYPE_HANDSHAKE, PACKAGE_TYPE_KICK},
};

use super::protocol::Pkg;

pub async fn handle_handshake(pkg: Pkg) -> Pkg {
    log::debug!("session recv data package PACKAGE_TYPE_HANDSHAKE");
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
        pkg_type: PACKAGE_TYPE_KICK,
        content: Some(PkgBody::StrMsg("handshake fail".to_string())),
    }
}

async fn handle_str_msg(msg: String) -> Pkg {
    log::debug!("handle_str_msg {}", HANDSHAKE_RET);

    Pkg {
        pkg_type: PACKAGE_TYPE_HANDSHAKE,
        content: Some(PkgBody::StrMsg(HANDSHAKE_RET.to_string())),
    }
}
