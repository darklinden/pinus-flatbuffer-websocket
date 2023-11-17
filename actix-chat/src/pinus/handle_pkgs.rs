use super::{
    handle_data::handle_data,
    handle_handshake::handle_handshake,
    handle_handshake_ack::handle_handshake_ack,
    handle_heartbeat::handle_heartbeat,
    protocol::{
        Pkg, PkgBody, PACKAGE_TYPE_DATA, PACKAGE_TYPE_HANDSHAKE, PACKAGE_TYPE_HANDSHAKE_ACK,
        PACKAGE_TYPE_HEARTBEAT, PACKAGE_TYPE_KICK,
    },
};

pub async fn handle_pkgs(pkgs: Vec<Pkg>) -> Vec<Pkg> {
    let mut result = Vec::new();
    for pkg in pkgs {
        result.push(handle_pkg(pkg).await);
    }
    result
}

pub async fn handle_pkg(pkg: Pkg) -> Pkg {
    match pkg.pkg_type {
        PACKAGE_TYPE_HANDSHAKE => handle_handshake(pkg).await,
        PACKAGE_TYPE_HANDSHAKE_ACK => handle_handshake_ack(pkg).await,
        PACKAGE_TYPE_HEARTBEAT => handle_heartbeat(pkg).await,
        PACKAGE_TYPE_DATA => handle_data(pkg).await,
        _ => {
            log::error!("session recv unknown package type {}", pkg.pkg_type);
            Pkg {
                pkg_type: PACKAGE_TYPE_KICK,
                content: Some(PkgBody::StrMsg("unknown package type".to_string())),
            }
        }
    }
}
