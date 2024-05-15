use super::pkg::{Pkg, PkgBody, PkgType};
use anyhow::Result;

pub async fn handle_heartbeat(_pkg: Pkg) -> Result<Option<Pkg>> {
    log::debug!("handle {}", PkgType::Heartbeat);

    // heartbeat no content
    Ok(Some(Pkg {
        pkg_type: PkgType::Heartbeat,
        content: PkgBody::None,
    }))
}
