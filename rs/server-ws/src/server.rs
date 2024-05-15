use std::collections::HashMap;

use actix::prelude::*;
use rand::{self, rngs::ThreadRng, Rng};

use crate::{
    actix_msgs::{Connect, Disconnect, SessionBindUser},
    pinus::pkg::Pkg,
    session::WsSession,
};

#[derive(Debug)]
pub struct WsServer {
    // 存储所有的 <session_id, session>
    sessions: HashMap<u64, Addr<WsSession>>,

    // <player_id, session_id>
    player_session: HashMap<i64, u64>,
    // <session_id, player_id>
    session_player: HashMap<u64, i64>,

    rng: ThreadRng,
}

impl WsServer {
    pub fn new() -> WsServer {
        WsServer {
            sessions: HashMap::new(),
            player_session: HashMap::new(),
            session_player: HashMap::new(),
            rng: rand::thread_rng(),
        }
    }
}

impl WsServer {
    /// Send message to all users in the channel
    #[allow(dead_code)]
    fn send_message_to_player(&self, player_id: i64, pkg: &Pkg) {
        if let Some(session_id) = self.player_session.get(&player_id) {
            if let Some(addr) = self.sessions.get(session_id) {
                addr.do_send(pkg.to_owned());
            }
        }
    }
}

impl WsServer {
    /// Send message to user by id
    #[allow(dead_code)]
    fn send_message_by_id(&self, session_id: u64, pkg: &Pkg) {
        if let Some(addr) = self.sessions.get(&session_id) {
            addr.do_send(pkg.to_owned());
        }
    }
}

/// Make actor from `WsServer`
impl Actor for WsServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

/// Handler for Connect message.
///
/// Register new session and assign unique id to this session
impl Handler<Connect> for WsServer {
    type Result = u64;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        // register session with random id
        let mut session_id: u64 = self.rng.gen::<u64>();
        while self.sessions.contains_key(&session_id) {
            session_id = self.rng.gen::<u64>();
        }
        self.sessions.insert(session_id, msg.addr);

        log::info!("current session count: {}", self.sessions.len());

        // send id back
        session_id
    }
}

/// Handler for Disconnect message.
impl Handler<Disconnect> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        // remove address
        if self.sessions.remove(&msg.session_id).is_some() {
            log::info!("current session count: {}", self.sessions.len());
        }

        self.player_session.remove(&msg.player_id);
        self.session_player.remove(&msg.session_id);
    }
}

/// Handler for SessionBindPlayer.
impl Handler<SessionBindUser> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: SessionBindUser, _: &mut Context<Self>) {
        let session_id = self.player_session.entry(msg.user_id).or_default();
        *session_id = msg.session_id;

        let player_id = self.session_player.entry(msg.session_id).or_default();
        *player_id = msg.user_id;
    }
}
