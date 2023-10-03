use actix_web::web;

async fn root_get_ok() -> String {
    "Server Is Running".to_string()
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/", web::get().to(root_get_ok));
}
