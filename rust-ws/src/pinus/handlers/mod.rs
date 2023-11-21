use super::super::pinus::msg::Msg;
use anyhow::Result;

mod entry;

#[allow(dead_code)]
pub const ROUTE_LIST: &'static [&'static str] = &[
    "no-route",
    "entry.entry",
];

#[allow(dead_code)]
pub async fn handle_data_msg(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    msg: Msg,
) -> Option<Msg> {
    let route_str = msg.route.to_owned().name.unwrap();
    let route = route_str.as_str();
    let result = match route {
        "entry.entry" => entry::entry(rd, pg, msg).await, // RequestUserEnter ResponseUserEnter 
        _ => Result::Err(anyhow::anyhow!("route not found")),
    };

    if result.is_err() {
        log::error!("handle_data_msg error: {:?}", result.err());
        return None;
    }

    let result = result.unwrap();
    return result;
}
