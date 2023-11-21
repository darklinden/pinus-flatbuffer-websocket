use actix_web::{error, web};

pub async fn redis_conn(redis: web::Data<redis::Client>) -> redis::aio::ConnectionManager {
    let rd = redis
        .get_tokio_connection_manager()
        .await
        .map_err(error::ErrorInternalServerError)
        .unwrap();
    rd
}

pub trait FromEnt<T>: Sized {
    fn from_ent(v: &T) -> Self;
}
