use super::env_config::{get_config, ConfigKeys};
use super::time::now_sec;
use anyhow::Result;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthDto {
    pub uid: i64,
    pub exp: i64,
    pub iat: i64,
}

pub const ALGORITHM: Algorithm = Algorithm::ES256;
pub const PRIVATE_KEY: &[u8] = include_bytes!("../keys/jwtES256.pkcs8.pem");
pub const PUBLIC_KEY: &[u8] = include_bytes!("../keys/jwtES256.pub");

#[allow(dead_code)]
pub fn sign(uid: i64) -> Result<String> {
    let now = now_sec();
    let exp_time = get_config::<i64>(ConfigKeys::JWT_EXPIRATION_TIME)?;
    let token = encode(
        &Header::new(ALGORITHM),
        &AuthDto {
            uid,
            exp: now + exp_time,
            iat: now,
        },
        &EncodingKey::from_ec_pem(PRIVATE_KEY)?,
    )?;

    Ok(token)
}

#[allow(dead_code)]
pub fn verify(token: &str) -> Result<AuthDto> {
    let token_data = decode::<AuthDto>(
        token,
        &DecodingKey::from_ec_pem(PUBLIC_KEY)?,
        &Validation::new(ALGORITHM),
    )?;

    Ok(token_data.claims)
}
