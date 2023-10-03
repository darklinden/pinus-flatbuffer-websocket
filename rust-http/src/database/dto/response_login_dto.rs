use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ResponseLoginDto {
    pub token: String,
}
