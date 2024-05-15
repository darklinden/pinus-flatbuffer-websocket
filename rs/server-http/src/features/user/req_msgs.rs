use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestUserMsg {
    pub account: Option<String>,
    pub password: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ResponseLoginMsg {
    pub token: String,
}
