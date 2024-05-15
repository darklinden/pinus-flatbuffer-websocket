#![allow(dead_code)]
pub fn encrypt_password(password: &str) -> String {
    // TODO: your own encryption here
    // ...

    password.to_owned()
}

#[allow(dead_code)]
pub fn check_password(password: &str, encrypted_password: &str) -> bool {
    let current_pass = encrypt_password(password);
    if current_pass == *encrypted_password {
        return true;
    }
    false
}
