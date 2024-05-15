use actix::prelude::*;
use actix_web_actors::ws;
use std::time::{Duration, Instant};

use crate::actix_msgs::{Connect, Disconnect, SessionBindUser};
use crate::pinus::handle_pkgs::handle_pkgs;
use crate::pinus::pkg::{Pkg, PkgType};
use crate::server::WsServer;

use utils::constants::heartbeat_secs;

#[derive(Debug)]
pub struct WsSession {
    /// unique session id
    pub session_id: u64,

    /// 账号id
    pub player_id: i64,
    /// 权限等级
    pub role_level: i32,

    pub heartbeat: Instant,

    /// server
    pub addr: Addr<WsServer>,

    /// redis & database connection
    pub redis_conn: actix_web::web::Data<redis::Client>,
    pub pg_conn: actix_web::web::Data<sea_orm::DatabaseConnection>,
}

pub struct WsSessionData {
    pub session_id: u64,
    pub user_id: i64,
    pub role_level: i32,
    pub session: Addr<WsSession>,
    pub server: Addr<WsServer>,
    pub redis_conn: actix_web::web::Data<redis::Client>,
    pub pg_conn: actix_web::web::Data<sea_orm::DatabaseConnection>,
}

impl WsSession {
    /// also this method checks heartbeats from client
    fn heartbeat(&self, ctx: &mut ws::WebsocketContext<Self>) {
        let hb = heartbeat_secs();

        if 0 == hb {
            log::info!("heartbeat_interval is 0, skipping heartbeat check");
            return;
        }

        let hb_dur = Duration::from_secs(hb);

        ctx.run_interval(hb_dur, |act, ctx| {
            // check client heartbeats
            let hb = heartbeat_secs();
            let ct = hb * 2;
            if Instant::now().duration_since(act.heartbeat).as_secs() > ct {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // notify chat server
                act.addr.do_send(Disconnect {
                    session_id: act.session_id,
                    player_id: act.player_id,
                });

                // stop actor
                ctx.stop();
            }
        });
    }
}

impl Actor for WsSession {
    type Context = ws::WebsocketContext<Self>;

    /// Method is called on actor start.
    /// We register ws session with Server
    fn started(&mut self, ctx: &mut Self::Context) {
        // we'll start heartbeat process on session start.
        self.heartbeat(ctx);

        // register self in chat server. `AsyncContext::wait` register
        // future within context, but context waits until this future resolves
        // before processing any other events.
        // HttpContext::state() is instance of WsChatSessionState, state is shared
        // across all routes within application
        let addr: Addr<WsSession> = ctx.address();
        self.addr
            .send(Connect { addr })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => {
                        log::debug!("ws session started: {}", res);
                        act.session_id = res;
                    }
                    // something is wrong with chat server
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        log::debug!("ws session stopping: {}", self.session_id);

        // notify chat server
        self.addr.do_send(Disconnect {
            session_id: self.session_id,
            player_id: self.player_id,
        });
        Running::Stop
    }
}

/// WebSocket message handler
/// for response client requests
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(e) => {
                log::info!(
                    "ws session recv message error: {} {:#?}",
                    self.session_id,
                    e
                );
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(_) => (),
            ws::Message::Pong(_) => (),
            ws::Message::Text(_) => (),
            ws::Message::Binary(bytes) => {
                let pkgs = Pkg::decode(&bytes).unwrap();

                let addr = ctx.address();
                let session_data = WsSessionData {
                    session_id: self.session_id,
                    user_id: self.player_id,
                    role_level: self.role_level,
                    session: addr.clone(),
                    server: self.addr.clone(),
                    redis_conn: self.redis_conn.clone(),
                    pg_conn: self.pg_conn.clone(),
                };

                let future = async move {
                    let reader = handle_pkgs(session_data, pkgs).await;
                    for pkg in reader {
                        addr.do_send(pkg);
                    }
                };

                future.into_actor(self).spawn(ctx);
            }
            ws::Message::Close(reason) => {
                log::info!(
                    "ws session recv close: sid {} pid {}",
                    self.session_id,
                    self.player_id
                );
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                log::info!(
                    "ws session recv continuation: sid {} pid {}",
                    self.session_id,
                    self.player_id
                );
            }
            ws::Message::Nop => (),
        }
    }
}

/// Handler for Package message.
/// for notify bytes to client
impl Handler<Pkg> for WsSession {
    type Result = ();

    fn handle(&mut self, pkg: Pkg, ctx: &mut Self::Context) {
        log::debug!("session {} send package \n{:#?}", self.session_id, pkg);

        match pkg.pkg_type {
            PkgType::Heartbeat => {
                // refresh time
                self.heartbeat = Instant::now();

                // send message
                let msg_bytes = pkg.encode();
                if msg_bytes.is_err() {
                    log::error!("session handle encode pkg fail {}", pkg.pkg_type);
                    return;
                }
                ctx.binary(msg_bytes.unwrap());
            }
            PkgType::Handshake | PkgType::Data => {
                // send message only
                let msg_bytes = pkg.encode();
                if msg_bytes.is_err() {
                    log::error!("session handle encode pkg fail {}", pkg.pkg_type);
                    return;
                }
                ctx.binary(msg_bytes.unwrap());
            }
            PkgType::Kick => {
                // send message and close
                let msg_bytes = pkg.encode();
                if msg_bytes.is_err() {
                    log::error!("session handle encode pkg fail {}", pkg.pkg_type);
                    return;
                }
                ctx.binary(msg_bytes.unwrap());
                ctx.close(None);
                log::info!("session {} handle kick {:#?}, stop", self.session_id, pkg);
                ctx.stop();
            }
            _ => {
                log::error!("session handle unknown package type {}", pkg.pkg_type);
            }
        }
    }
}

/// Handler for SessionBindPlayer.
impl Handler<SessionBindUser> for WsSession {
    type Result = ();

    fn handle(&mut self, msg: SessionBindUser, _: &mut Self::Context) {
        if self.session_id != msg.session_id {
            log::error!(
                "session bind player fail, session_id not match {} {}",
                self.session_id,
                msg.session_id
            );
            return;
        }
        self.player_id = msg.user_id;
        self.role_level = msg.role_level;
    }
}
