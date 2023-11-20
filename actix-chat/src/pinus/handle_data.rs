use super::handlers::{handle_data_msg, ROUTE_LIST};
use super::pkg::{Pkg, PkgBody, PkgType};

pub async fn handle_data(pkg: Pkg) -> Pkg {
    log::debug!("handle {}", PkgType::Data);
    match pkg.content {
        PkgBody::None => Pkg {
            pkg_type: PkgType::Kick,
            content: PkgBody::StrMsg("handle data fail".to_string()),
        },
        PkgBody::Msg(msg) => handle_msg(msg).await,
        PkgBody::StrMsg(s) => handle_str_msg(s).await,
    }
}

pub fn code2route(route_code: u16) -> Option<String> {
    let route_list = ROUTE_LIST;
    let index = route_code as usize;
    if index > 0 && index < route_list.len() {
        return Some(route_list[index].to_string());
    }
    None
}

#[allow(dead_code)]
pub fn route2code(route: &str) -> Option<u16> {
    let route_list = ROUTE_LIST;
    for i in 1..route_list.len() {
        if route_list[i] == route {
            return Some(i as u16);
        }
    }

    None
}

async fn handle_msg(msg: super::msg::Msg) -> Pkg {
    log::debug!("handle msg {:?}", msg);

    let mut msg = msg;
    if msg.route.code.is_some() && msg.route.name.is_none() {
        let route_code = msg.route.code.unwrap();
        let route_name = code2route(route_code);
        if route_name.is_some() {
            let route_name = route_name.unwrap();
            msg.route.name = Some(route_name);
        }
    }

    let msg = handle_data_msg(msg).await;

    log::debug!("handle msg result {:?}", msg);

    Pkg {
        pkg_type: PkgType::Data,
        content: PkgBody::Msg(msg.unwrap()),
    }
}

async fn handle_str_msg(msg: String) -> Pkg {
    log::debug!("handle str {}", msg);

    Pkg {
        pkg_type: PkgType::Kick,
        content: PkgBody::StrMsg("handle data fail".to_string()),
    }
}
