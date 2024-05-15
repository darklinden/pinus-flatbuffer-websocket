use crate::{
    actix_msgs::SessionBindUser,
    logic::user_info_service::UserInfoService,
    pinus::msg::{Msg, MsgType},
    session::WsSessionData,
};
use anyhow::{Context, Result};
use database::service::user_login_db;
use macro_markers::mark_route;
use protocols::proto::{
    RequestUserEnter, RequestUserHello, ResponseUserEnter, ResponseUserEnterArgs,
    ResponseUserHello, ResponseUserHelloArgs, ServerErrorType,
};
use sea_orm::DatabaseConnection;

// import the flatbuffers runtime library
extern crate flatbuffers;

#[mark_route(RequestUserEnter, ResponseUserEnter)]
pub async fn entry(_sd: &WsSessionData, _msg: Msg) -> Result<Option<Msg>> {
    if _msg.body.is_none() {
        return Err(anyhow::anyhow!("body is none"));
    }

    let buf = _msg.body.unwrap();
    let in_msg = flatbuffers::root::<RequestUserEnter>(&buf).unwrap();
    let token = in_msg.token().unwrap();

    log::debug!("session handle entry {:?}", token);

    let mut rd = _sd.redis_conn.get_connection_manager().await?;
    let pg: &DatabaseConnection = &_sd.pg_conn.clone();

    let user_info = UserInfoService::user_enter_get_info(&mut rd, pg, token).await?;
    log::debug!("user_info {:?}", &user_info);

    let user = user_login_db::DbService::find_by_id(&mut rd, pg, &user_info.user_id).await?;
    let user_role = user
        .context(format!("user not found: {}", user_info.user_id))?
        .role;

    // 下一个命令可能就要使用 player_id 了, 所以这里需要等待
    _sd.session
        .send(SessionBindUser {
            session_id: _sd.session_id,
            user_id: user_info.user_id,
            role_level: user_role,
        })
        .await?;

    // server 上的 player_id 与 session_id 的绑定关系需要更新但没有那么急, 这里异步 do_send
    _sd.server.do_send(SessionBindUser {
        session_id: _sd.session_id,
        user_id: user_info.user_id,
        role_level: user_role,
    });

    // do sth

    let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

    let user_offset = user_info.pack(&mut builder);
    let response_user_enter = ResponseUserEnter::create(
        &mut builder,
        &ResponseUserEnterArgs {
            code: ServerErrorType::ERR_SUCCESS.0,
            user: Some(user_offset),
        },
    );
    builder.finish(response_user_enter, None);
    let buf = builder.finished_data(); // Of type `&[u8]`

    Ok(Some(Msg {
        id: _msg.id,
        msg_type: MsgType::Response,
        route: _msg.route,
        body: Some(buf.to_vec()),
    }))
}

#[mark_route(RequestUserHello, ResponseUserHello)]
pub async fn hello(_sd: &WsSessionData, _msg: Msg) -> Result<Option<Msg>> {
    // 目前没有参数
    // if _msg.body.is_none() {
    //     return Err(anyhow::anyhow!("body is none"));
    // }

    // let buf = _msg.body.unwrap();
    // let in_msg = flatbuffers::root::<RequestUserEnter>(&buf).unwrap();

    let user_id = _sd.user_id;
    let user_role = _sd.role_level;
    log::debug!(
        "session handle entry hello user_id {:?} user_role {:?}",
        user_id,
        user_role
    );

    if user_id == 0 {
        return Err(anyhow::anyhow!("user_id is 0"));
    }

    let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

    let say = builder.create_string("Hello World!");

    let resp = ResponseUserHello::create(
        &mut builder,
        &ResponseUserHelloArgs {
            code: 0,
            say: Some(say),
        },
    );

    builder.finish(resp, None);

    let buf = builder.finished_data(); // Of type `&[u8]`

    Ok(Some(Msg {
        id: _msg.id,
        msg_type: MsgType::Response,
        route: _msg.route,
        body: Some(buf.to_vec()),
    }))
}
