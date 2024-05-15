use actix_web::web;

mod req_msgs;
mod user_controller;
mod user_service;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .route("/register", web::post().to(user_controller::register))
            .route("/login", web::post().to(user_controller::login)),
    );
}
