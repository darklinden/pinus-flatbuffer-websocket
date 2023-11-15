use std::collections::{HashMap, HashSet};

use actix::prelude::*;
use async_trait::async_trait;
use rand::{self, rngs::ThreadRng, Rng};

use crate::pinus::protocol::{
    Pkg, PkgBody, PACKAGE_TYPE_DATA, PACKAGE_TYPE_HANDSHAKE, PACKAGE_TYPE_HANDSHAKE_ACK,
    PACKAGE_TYPE_HEARTBEAT, PACKAGE_TYPE_KICK,
};

use crate::handlers::route_to;

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
        println!("WsServer new {}", server_id);
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
        println!("Someone joined");

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

        log::info!("current sessions: {:?}", self.sessions.len());

        // send id back
        session_id
    }
}

/// Handler for Disconnect message.
impl Handler<Disconnect> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
        println!("Someone disconnected");

        // let mut channels_leave_msg: Vec<String> = Vec::new();

        // remove address
        if self.sessions.remove(&msg.id).is_some() {
            // remove session from all channels and deliver `Leave` to other users
            for (_, sessions) in &mut self.channels {
                if sessions.remove(&msg.id) {
                    // channels_leave_msg.push(name.to_owned());
                }
            }
        }
        // send message to other users
        // for c in channels_leave_msg {
        //     self.send_message(&c, "Someone disconnected", 0);
        // }
    }
}

/// Handler for Package message from session.
impl Handler<Pkg> for WsServer {
    type Result = ();

    fn handle(&mut self, pkg: Pkg, ctx: &mut Context<Self>) {
        println!("session recv package {}", pkg.pkg_type);
        match pkg.pkg_type {
            PACKAGE_TYPE_HANDSHAKE => {
                println!("session recv data package PACKAGE_TYPE_HANDSHAKE");
            }
            PACKAGE_TYPE_HANDSHAKE_ACK => {
                println!("session recv data package PACKAGE_TYPE_HANDSHAKE_ACK");
            }
            PACKAGE_TYPE_HEARTBEAT => {
                println!("session recv data package PACKAGE_TYPE_HEARTBEAT");
            }
            PACKAGE_TYPE_DATA => {
                println!("session recv data package PACKAGE_TYPE_DATA");
            }
            PACKAGE_TYPE_KICK => {
                println!("session recv data package PACKAGE_TYPE_KICK");
            }
            _ => {
                println!("session recv unknown package type {}", pkg.pkg_type);
            }
        }

        match pkg.content.unwrap() {
            PkgBody::Msg(msg) => {
                println!(
                    "session recv data package route {}",
                    msg.route.to_owned().unwrap().name.unwrap()
                );
            }
            PkgBody::StrMsg(s) => {
                println!("session recv data str {}", s);
            }
        }
    }
}
