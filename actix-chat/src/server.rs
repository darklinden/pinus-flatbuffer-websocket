use std::collections::{HashMap, HashSet};

use actix::prelude::*;
use rand::{self, rngs::ThreadRng, Rng};

use crate::pinus::pkg::Pkg;

/// New chat session is created
#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Pkg>,
}

/// Session is disconnected
#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: usize,
}

#[derive(Debug)]
pub struct WsServer {
    #[allow(dead_code)]
    server_id: i32,
    // 存储所有的 session
    sessions: HashMap<usize, Recipient<Pkg>>,
    // 存储 channel 列表
    channels: HashMap<String, HashSet<usize>>,
    rng: ThreadRng,
}

static SERVER_ID_SEQ: i32 = 0;

impl WsServer {
    pub fn new() -> WsServer {
        let server_id = SERVER_ID_SEQ + 1;
        log::info!("WsServer new {}", server_id);
        WsServer {
            server_id: server_id,
            sessions: HashMap::new(),
            channels: HashMap::new(),
            rng: rand::thread_rng(),
        }
    }
}

impl WsServer {
    /// Send message to all users in the channel
    #[allow(dead_code)]
    fn send_message_by_channel(&self, channel_id: &str, pkg: &Pkg, skip_id: usize) {
        if let Some(chanel_list) = self.channels.get(channel_id) {
            for session_id in chanel_list {
                if *session_id != skip_id {
                    if let Some(addr) = self.sessions.get(session_id) {
                        addr.do_send(pkg.to_owned());
                    }
                }
            }
        }
    }
}

impl WsServer {
    /// Send message to user by id
    #[allow(dead_code)]
    fn send_message_by_id(&self, session_id: usize, pkg: &Pkg) {
        if let Some(addr) = self.sessions.get(&session_id) {
            addr.do_send(pkg.to_owned());
        }
    }
}

/// Make actor from `ChatServer`
impl Actor for WsServer {
    /// We are going to use simple Context, we just need ability to communicate
    /// with other actors.
    type Context = Context<Self>;
}

/// Handler for Connect message.
///
/// Register new session and assign unique id to this session
impl Handler<Connect> for WsServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
        // register session with random id
        let mut session_id: usize = self.rng.gen::<usize>();
        while self.sessions.contains_key(&session_id) {
            session_id = self.rng.gen::<usize>();
        }
        self.sessions.insert(session_id, msg.addr);

        // auto join session to main room
        if !self.channels.contains_key("main") {
            self.channels.insert("main".to_owned(), HashSet::new());
        }
        self.channels
            .entry("main".to_owned())
            .or_default()
            .insert(session_id);

        log::info!("current session count: {}", self.sessions.len());

        // send id back
        session_id
    }
}

/// Handler for Disconnect message.
impl Handler<Disconnect> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        // let mut channels_leave_msg: Vec<String> = Vec::new();

        // remove address
        if self.sessions.remove(&msg.id).is_some() {
            // remove session from all channels and deliver `Leave` to other users
            for (_, sessions) in &mut self.channels {
                if sessions.remove(&msg.id) {
                    // channels_leave_msg.push(name.to_owned());
                }
            }

            log::info!("current session count: {}", self.sessions.len());
        }
        // send message to other users
        // for c in channels_leave_msg {
        //     self.send_message(&c, "Someone disconnected", 0);
        // }
    }
}
