use super::pkg::{Pkg, PkgBody, PkgType};

pub async fn handle_heartbeat(_pkg: Pkg) -> Pkg {
    log::debug!("handle {}", PkgType::Heartbeat);

    // heartbeat no content
    Pkg {
        pkg_type: PkgType::Heartbeat,
        content: PkgBody::None,
    }
}
