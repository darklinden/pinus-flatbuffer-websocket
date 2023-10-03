use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseResult<T> {
    pub code: i32,
    pub data: Option<T>,
}
