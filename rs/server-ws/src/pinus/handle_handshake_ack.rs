use super::pkg::{Pkg, PkgBody, PkgType};
use anyhow::Result;

pub async fn handle_handshake_ack(_pkg: Pkg) -> Result<Option<Pkg>> {
    log::debug!("handle {}", PkgType::HandshakeAck);

    // handshake ack no content
    Ok(Some(Pkg {
        pkg_type: PkgType::Heartbeat,
        content: PkgBody::None,
    }))
}
