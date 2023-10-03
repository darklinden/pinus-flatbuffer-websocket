#[allow(non_camel_case_types, dead_code)]
#[derive(Debug, Clone, Copy)]
pub enum ServerErrorType {
    ERR_SUCCESS = 0,
    ERR_FAILED = 1,
}

impl From<tokio_postgres::error::Error> for ServerErrorType {
    fn from(error: tokio_postgres::error::Error) -> Self {
        println!("{}", error.to_string());
        ServerErrorType::ERR_FAILED
    }
}
