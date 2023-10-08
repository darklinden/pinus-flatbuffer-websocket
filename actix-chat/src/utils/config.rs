#[allow(non_camel_case_types, dead_code)]
pub enum ConfigKeys {
    DATABASE_URL,
    REDIS_URL,
    JWT_EXPIRATION_TIME,
    HTTP_SERVER_CLUSTER,
    HTTP_SERVER_PORT,
}

impl ConfigKeys {
    pub fn as_str(&self) -> &'static str {
        match self {
            ConfigKeys::DATABASE_URL => "DATABASE_URL",
            ConfigKeys::REDIS_URL => "REDIS_URL",
            ConfigKeys::JWT_EXPIRATION_TIME => "JWT_EXPIRATION_TIME",
            ConfigKeys::HTTP_SERVER_CLUSTER => "HTTP_SERVER_CLUSTER",
            ConfigKeys::HTTP_SERVER_PORT => "HTTP_SERVER_PORT",
        }
    }
}

pub fn get_config_str(key: ConfigKeys) -> String {
    let k = key.as_str();
    let value = dotenv::var(k);
    match value {
        Ok(value) => value,
        Err(_) => match key {
            ConfigKeys::DATABASE_URL | ConfigKeys::REDIS_URL => {
                panic!("{} is not set in .env file", k);
            }
            ConfigKeys::JWT_EXPIRATION_TIME => {
                // default 1 day
                86400.to_string()
            }
            ConfigKeys::HTTP_SERVER_CLUSTER => {
                // default 1
                1.to_string()
            }
            ConfigKeys::HTTP_SERVER_PORT => {
                // default 3000
                3010.to_string()
            }
        },
    }
}

pub fn get_config<T>(key: ConfigKeys) -> Result<T, <T>::Err>
where
    T: std::str::FromStr,
    <T as std::str::FromStr>::Err: std::fmt::Debug,
{
    return get_config_str(key).parse::<T>();
}
