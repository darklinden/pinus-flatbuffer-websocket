#![deny(clippy::all)]

use napi_derive::napi;
use serde::{Deserialize, Serialize};

use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthDto {
  // standard claims
  pub exp: Option<i64>,
  pub iat: Option<i64>,
  // content like user id, email, etc
  pub uid: Option<i64>,
}

pub const ALGORITHM: Algorithm = Algorithm::ES256;
pub const PRIVATE_KEY: &[u8] = include_bytes!("../../keys/jwtES256.pkcs8.pem");
pub const PUBLIC_KEY: &[u8] = include_bytes!("../../keys/jwtES256.pub");

#[napi]
pub fn sign(payload: String) -> Option<String> {

  let dto: AuthDto = serde_json::from_str(&payload).unwrap();

  let token = encode(
    &Header::new(ALGORITHM),
    &dto,
    &EncodingKey::from_ec_pem(PRIVATE_KEY).unwrap(),
  );

  if token.is_ok() {
    return Some(token.unwrap());
  }

  None
}

#[napi]
pub fn verify(token: String) -> Option<String> {
  let token_data = decode::<AuthDto>(
    &token,
    &DecodingKey::from_ec_pem(PUBLIC_KEY).unwrap(),
    &Validation::new(ALGORITHM),
  );

  match token_data {
    Ok(token_data) => return Some(serde_json::to_string(&token_data.claims).unwrap()),
    _ => None,
  }
}
