#![allow(dead_code)]
pub fn encrypt_password(password: &String) -> String {
    // TODO: your own encryption here
    // ...

    return password.to_owned();
}

#[allow(dead_code)]
pub fn check_password(password: &String, encrypted_password: &String) -> bool {
    let current_pass = encrypt_password(password);
    if current_pass == *encrypted_password {
        return true;
    }
    return false;
}
