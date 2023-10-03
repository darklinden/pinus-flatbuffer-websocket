use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestUserDto {
    pub account: Option<String>,
    pub password: Option<String>,
}
