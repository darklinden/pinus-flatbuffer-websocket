use actix::prelude::*;

use crate::session::WsSession;

/// New chat session is created
#[derive(Message)]
#[rtype(u64)]
pub struct Connect {
    pub addr: Addr<WsSession>,
}

/// Session is disconnected
#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub session_id: u64,
    pub player_id: i64,
}

/// Session is disconnected
#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct SessionBindUser {
    pub session_id: u64,
    pub user_id: i64,
    pub role_level: i32,
}
