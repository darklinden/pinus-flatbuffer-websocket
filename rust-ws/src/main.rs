use sea_orm::Database;
use std::time::Instant;

use actix::*;
use actix_web::{middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

mod database;
mod features;
mod pinus;
mod server;
mod session;
mod utils;

use utils::config::{get_config, get_config_str, ConfigKeys};

/// Entry point for our websocket route
async fn route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::WsServer>>,
    redis_conn: web::Data<redis::Client>,
    pg_conn: web::Data<sea_orm::DatabaseConnection>,
) -> Result<HttpResponse, Error> {
    log::debug!("web route request: {:?}", req);

    ws::start(
        session::WsSession {
            id: 0,
            heartbeat: Instant::now(),
            room: "main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
            redis_conn: redis_conn.clone(),
            pg_conn: pg_conn.clone(),
        },
        &req,
        stream,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let log_level = get_config::<String>(ConfigKeys::HTTP_SERVER_LOG_LEVEL).unwrap();
    let log_backtrace = get_config::<String>(ConfigKeys::HTTP_SERVER_LOG_BACKTRACE).unwrap();
    println!("log_level: {}", log_level);
    println!("log_backtrace: {}", log_backtrace);
    env_logger::init_from_env(env_logger::Env::new().default_filter_or(log_level));
    std::env::set_var("RUST_BACKTRACE", log_backtrace);

    // config for database
    let db_url = get_config_str(ConfigKeys::DATABASE_URL);
    let postgres_connect = Database::connect(&db_url).await.unwrap();

    // config for redis
    let redis_url = get_config_str(ConfigKeys::REDIS_URL);
    let redis = redis::Client::open(redis_url).unwrap();

    // test redis connection
    let _ = redis.get_connection().unwrap();

    // config for server
    let server_port = get_config::<u16>(ConfigKeys::HTTP_SERVER_PORT).unwrap();
    let cluster_enable = get_config::<usize>(ConfigKeys::HTTP_SERVER_CLUSTER).unwrap();
    let cluster_count: usize;
    if cluster_enable > 0 {
        cluster_count = std::thread::available_parallelism().map_or(2, std::num::NonZeroUsize::get);
    } else {
        cluster_count = 1;
    }

    // start chat server actor
    let server = server::WsServer::new().start();

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .app_data(web::Data::new(postgres_connect.clone()))
            .app_data(web::Data::new(redis.clone()))
            .route("/", web::get().to(route))
            .wrap(Logger::default())
    })
    .workers(cluster_count)
    .bind(("0.0.0.0", server_port))?
    .run();

    log::info!("starting HTTP server at http://localhost:{}", server_port);

    server.await
}