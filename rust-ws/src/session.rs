use actix::prelude::*;
use actix_web_actors::ws;
use std::time::Instant;

use crate::pinus::constants::{CLIENT_TIMEOUT, HEARTBEAT_INTERVAL};
use crate::pinus::handle_pkgs::handle_pkgs;
use crate::pinus::pkg::{Pkg, PkgType};
use crate::server;

#[derive(Debug)]
pub struct WsSession {
    /// unique session id
    pub id: usize,

    /// Client must send ping at least once per 10 seconds (CLIENT_TIMEOUT),
    /// otherwise we drop connection.
    pub heartbeat: Instant,

    /// joined room
    pub room: String,

    /// peer name
    pub name: Option<String>,

    /// Chat server
    pub addr: Addr<server::WsServer>,

    pub redis_conn: actix_web::web::Data<redis::Client>,
    pub pg_conn: actix_web::web::Data<sea_orm::DatabaseConnection>,
}

impl WsSession {
    /// helper method that sends ping to client every 5 seconds (HEARTBEAT_INTERVAL).
    ///
    /// also this method checks heartbeats from client
    fn heartbeat(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            // check client heartbeats
            if Instant::now().duration_since(act.heartbeat) > CLIENT_TIMEOUT {
                // heartbeat timed out
                println!("Websocket Client heartbeat failed, disconnecting!");

                // notify chat server
                act.addr.do_send(server::Disconnect { id: act.id });

                // stop actor
                ctx.stop();

                // don't try to send a ping
                return;
            }
        });
    }
}

impl Actor for WsSession {
    type Context = ws::WebsocketContext<Self>;

    /// Method is called on actor start.
    /// We register ws session with ChatServer
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
            .send(server::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => {
                        log::debug!("ws session started: {}", res);
                        act.id = res;
                    }
                    // something is wrong with chat server
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        log::debug!("ws session stopping: {}", self.id);

        // notify chat server
        self.addr.do_send(server::Disconnect { id: self.id });
        Running::Stop
    }
}

/// WebSocket message handler
/// for response client requests
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(_) => {}
            ws::Message::Pong(_) => (),
            ws::Message::Text(_) => (),
            ws::Message::Binary(bytes) => {
                let pkgs = Pkg::decode(&bytes).unwrap();

                let recipient = ctx.address().recipient();
                let redis_conn = self.redis_conn.clone();
                let pg_conn = self.pg_conn.clone();

                let future = async move {
                    let rd = redis_conn.get_tokio_connection_manager().await;
                    if rd.is_err() {
                        log::error!("session handle get redis connection fail");
                        return;
                    }
                    let mut redis_client = rd.unwrap();
                    let pg = &pg_conn.into_inner();
                    let reader = handle_pkgs(&mut redis_client, pg, pkgs).await;
                    for pkg in reader {
                        recipient.do_send(pkg);
                    }
                };

                future.into_actor(self).spawn(ctx);
            }
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
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
        println!("session handle send package");

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
                ctx.stop();
            }
            _ => {
                log::error!("session handle unknown package type {}", pkg.pkg_type);
            }
        }
    }
}
