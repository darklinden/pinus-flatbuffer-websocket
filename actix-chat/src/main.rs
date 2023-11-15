use std::time::Instant;

use actix::*;
use actix_web::{middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

mod handlers;
mod pinus;
mod server;
mod session;
mod utils;
use utils::config::get_config;

use crate::utils::config::ConfigKeys;

/// Entry point for our websocket route
async fn route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::WsServer>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        session::WsSession {
            id: 0,
            heartbeat: Instant::now(),
            room: "main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // start chat server actor
    let server = server::WsServer::new().start();

    let server_port = get_config::<u16>(ConfigKeys::HTTP_SERVER_PORT).unwrap();

    log::info!("starting HTTP server at http://localhost:{}", server_port);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .route("/", web::get().to(route))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", server_port))?
    .run()
    .await
}
