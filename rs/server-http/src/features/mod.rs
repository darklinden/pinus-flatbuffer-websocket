mod user;
pub mod root_ok;

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(
        actix_web::web::scope("")
            .configure(root_ok::routes)
            .configure(user::routes),
    );
}
