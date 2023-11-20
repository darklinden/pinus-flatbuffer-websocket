use crate::pinus::msg::{Msg, MsgType};
use anyhow::Result;
use protocols::proto::{
    RequestUserEnter, ResponseUserEnter, ResponseUserEnterArgs, UserInfo, UserInfoArgs,
};
use route_marker::mark_route;

// import the flatbuffers runtime library
extern crate flatbuffers;

#[mark_route]
pub async fn entry(_msg: Msg) -> Result<Option<Msg>> {
    // in_msg : RequestUserEnter
    // out_msg : ResponseUserEnter

    if _msg.body.is_none() {
        return Err(anyhow::anyhow!("body is none"));
    }

    let buf = _msg.body.unwrap();
    let in_msg = flatbuffers::root::<RequestUserEnter>(&buf).unwrap();

    log::debug!("session handle entry {:?}", in_msg.token());

    // do sth

    let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

    let name = builder.create_string("hello");

    let user_info_offset = UserInfo::create(
        &mut builder,
        &UserInfoArgs {
            name: Some(name),
            level: 1,
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
