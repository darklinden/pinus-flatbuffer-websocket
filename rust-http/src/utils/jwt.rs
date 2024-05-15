use jsonwebtoken::{
    decode, encode,
    errors::ErrorKind::{ExpiredSignature, InvalidSignature, InvalidToken},
    Algorithm, DecodingKey, EncodingKey, Header, Validation,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthDto {
    pub uid: i64,
    pub exp: i64,
    pub iat: i64,
}

use serde::{Deserialize, Serialize};

use super::config::{get_config, ConfigKeys};

pub const ALGORITHM: Algorithm = Algorithm::ES256;
pub const PRIVATE_KEY: &[u8] = include_bytes!("../../keys/jwtES256.pkcs8.pem");
pub const PUBLIC_KEY: &[u8] = include_bytes!("../../keys/jwtES256.pub");

#[allow(dead_code)]
pub fn sign(uid: i64) -> String {
    let now = chrono::Utc::now(); // seconds since UNIX_EPOCH
    let exp_time = get_config(ConfigKeys::JWT_EXPIRATION_TIME)
        .parse::<i64>()
        .unwrap();
    let token = encode(
        &Header::new(ALGORITHM),
        &AuthDto {
            uid,
            exp: now.timestamp() + exp_time,
            iat: now.timestamp(),
        },
        &EncodingKey::from_ec_pem(PRIVATE_KEY).unwrap(),
    );

    token.unwrap()
}

#[allow(dead_code)]
pub fn verify(token: &str) -> AuthDto {
    let token_data = decode::<AuthDto>(
        token,
        &DecodingKey::from_ec_pem(PUBLIC_KEY).unwrap(),
        &Validation::new(ALGORITHM),
    );

    match token_data {
        Ok(token_data) => token_data.claims,
        Err(err) => match *err.kind() {
            InvalidToken => panic!("Token is invalid"),
            InvalidSignature => panic!("Token signature is invalid"),
            ExpiredSignature => panic!("Token is expired"),
            _ => panic!("Can't handle token"),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[actix_rt::test]
    async fn test_verify() {
        let token = sign(1);
        println!("{:?}", token);
        let token_data = verify(&token);
        println!("{:?}", token_data);
        assert_eq!(token_data.uid, 1);
    }
}
