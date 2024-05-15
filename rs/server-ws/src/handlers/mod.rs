// @generated
#![allow(dead_code)]
use anyhow::Result;

use super::pinus::{msg::Msg, msg::Route};
use crate::session::WsSessionData;

mod entry;

pub const NO_ROUTE: &str = "no-route";
pub const ENTRY_ENTRY: &str = "entry.entry";
pub const ENTRY_HELLO: &str = "entry.hello";

#[allow(dead_code)]
pub const ROUTE_LIST: &[&str] = &[
    NO_ROUTE,
    ENTRY_ENTRY,
    ENTRY_HELLO,
];

pub const CODE_NO_ROUTE: u16 = 0;
pub const CODE_ENTRY_ENTRY: u16 = 1;
pub const CODE_ENTRY_HELLO: u16 = 2;

pub const ROUTE_ENTRY_ENTRY: Route = Route::from(CODE_ENTRY_ENTRY);
pub const ROUTE_ENTRY_HELLO: Route = Route::from(CODE_ENTRY_HELLO);

#[allow(dead_code)]
pub fn route_name_to_code(route: &str) -> u16 {
    for (index, item) in ROUTE_LIST.iter().enumerate() {
        if item == &route {
            return index as u16;
        }
    }
    CODE_NO_ROUTE
}


#[allow(dead_code)]
pub fn route_code_to_name(code: u16) -> &'static str {
    if code < ROUTE_LIST.len() as u16 {
        return ROUTE_LIST[code as usize];
    }
    NO_ROUTE
}

#[rustfmt::skip]
#[allow(dead_code)]
pub async fn handle_data_msg(session_data: &WsSessionData, msg: Msg) -> Result<Option<Msg>> {
    let route_code = msg.route.to_owned().code.unwrap_or(0);
    match route_code {
        CODE_ENTRY_ENTRY => entry::entry(session_data, msg).await, // RequestUserEnter ResponseUserEnter 
        CODE_ENTRY_HELLO => entry::hello(session_data, msg).await, // RequestUserHello ResponseUserHello 
        _ => Err(anyhow::anyhow!("route not found")),
        }
    }
    