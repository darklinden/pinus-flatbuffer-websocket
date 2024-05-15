use protocols::proto::ServerErrorType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseResult<T> {
    pub code: i32,
    pub data: Option<T>,
    pub msg: Option<String>,
}

impl<T> std::convert::From<anyhow::Result<T>> for ResponseResult<T> {
    fn from(result: anyhow::Result<T>) -> Self {
        match result {
            Ok(data) => Self {
                code: ServerErrorType::ERR_SUCCESS.0,
                data: Some(data),
                msg: None,
            },
            Err(_) => Self {
                code: ServerErrorType::ERR_FAILED.0,
                data: None,
                msg: result.err().map(|e| e.to_string()),
            },
        }
    }
}
