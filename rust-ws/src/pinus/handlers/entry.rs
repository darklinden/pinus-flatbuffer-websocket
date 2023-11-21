use crate::{
    pinus::msg::{Msg, MsgType},
    utils::jwt,
};
use anyhow::Result;
use protocols::proto::{
    RequestUserEnter, ResponseUserEnter, ResponseUserEnterArgs, UserInfo, UserInfoArgs,
};
use route_marker::mark_route;

// import the flatbuffers runtime library
extern crate flatbuffers;

use crate::features::user_info::user_info_service::get_user_info_by_id;

#[mark_route(RequestUserEnter, ResponseUserEnter)]
pub async fn entry(
    rd: &mut redis::aio::ConnectionManager,
    pg: &sea_orm::DatabaseConnection,
    _msg: Msg,
) -> Result<Option<Msg>> {
    // in_msg : RequestUserEnter
    // out_msg : ResponseUserEnter

    if _msg.body.is_none() {
        return Err(anyhow::anyhow!("body is none"));
    }

    let buf = _msg.body.unwrap();
    let in_msg = flatbuffers::root::<RequestUserEnter>(&buf).unwrap();

    let token = in_msg.token().unwrap();
    log::debug!("session handle entry {:?}", token);

    let auth = jwt::verify(&token.to_string());
    let uid = auth.uid;

    let user_info = get_user_info_by_id(rd, pg, uid).await?;

    log::debug!("user_info {:?}", &user_info);

    // do sth

    let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

    let name = builder.create_string(user_info.name.as_str());

    let user_info_offset = UserInfo::create(
        &mut builder,
        &UserInfoArgs {
            name: Some(name),
            level: user_info.level,
        },
    );

    let response_user_enter = ResponseUserEnter::create(
        &mut builder,
        &ResponseUserEnterArgs {
            code: 0,
            user: Some(user_info_offset),
        },
    );

    builder.finish(response_user_enter, None);

    let buf = builder.finished_data(); // Of type `&[u8]`

    log::debug!("_msg.msg_type {:?}", _msg.msg_type);

    let ret_msg_type = if _msg.msg_type == MsgType::Request {
        MsgType::Response
    } else {
        MsgType::Push
    };

    log::debug!("ret_msg_type {:?}", ret_msg_type);

    Ok(Some(Msg {
        id: _msg.id,
        msg_type: ret_msg_type,
        route: _msg.route,
        body: Some(buf.to_vec()),
    }))
}
