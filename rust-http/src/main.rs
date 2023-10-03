use actix_web::{web, App, HttpServer};
use sea_orm::Database;

use crate::utils::config::get_config;
use crate::utils::config::ConfigKeys;

mod database;

mod features;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("debug"));

    // config for database
    let db_url = get_config(ConfigKeys::DATABASE_URL);
    let postgres_connect = Database::connect(&db_url).await.unwrap();

    // config for redis
    let redis_url = get_config(ConfigKeys::REDIS_URL);
    let redis = redis::Client::open(redis_url).unwrap();

    // test redis connection
    #[warn(unused_must_use)]
    let _ = redis.get_connection().unwrap();

    // config for http server
    let server_port = get_config(ConfigKeys::HTTP_SERVER_PORT)
        .parse::<u16>()
        .unwrap();

    let cluster_enabled = get_config(ConfigKeys::HTTP_SERVER_CLUSTER)
        .parse::<usize>()
        .unwrap();

    let worker_count = if cluster_enabled > 0 {
        std::thread::available_parallelism().map_or(2, std::num::NonZeroUsize::get)
    } else {
        1
    };

    let server = HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(postgres_connect.clone()))
            .app_data(web::Data::new(redis.clone()))
            .configure(features::routes)
    })
    .bind(("0.0.0.0", server_port))?
    .workers(worker_count)
    .run();

    log::info!("starting HTTP server at http://localhost:{}", server_port);

    server.await
}
