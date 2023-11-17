mod entry;
mod logic;

#[allow(dead_code)]
pub async fn route_to(route: String, arg: Vec<u8>) -> Vec<u8> {
    match route.as_str() {
        "entry.ask" => entry::ask(arg).await,
        "entry.entry" => entry::entry(arg).await,
        "entry.exit" => entry::exit(arg).await,
        "entry.question" => entry::question(arg).await,
        "entry.test" => entry::test(arg).await,
        "entry.test1" => entry::test1(arg).await,
        "logic.ask" => logic::ask(arg).await,
        "logic.entry" => logic::entry(arg).await,
        "logic.exit" => logic::exit(arg).await,
        "logic.question" => logic::question(arg).await,
        "logic.test" => logic::test(arg).await,
        "logic.test1" => logic::test1(arg).await,
        _ => panic!("invalid route: {}", route),
    }
}

#[allow(dead_code)]
pub const HANDSHAKE_RET: &str = r#"{
"code":200,
"sys":{
"heartbeat":5000,
"dict":{
"entry.ask":1,
"entry.entry":2,
"entry.exit":3,
"entry.question":4,
"entry.test":5,
"entry.test1":6,
"logic.ask":7,
"logic.entry":8,
"logic.exit":9,
"logic.question":10,
"logic.test":11,
"logic.test1":12
}
}
}"#;