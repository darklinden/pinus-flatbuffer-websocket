use route_marker::mark_route;

#[derive(Debug)]
pub struct EntryHandler {}

#[mark_route]
pub async fn entry(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, entry!");
    Vec::new()
}

#[mark_route]
pub async fn exit(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, exit!");
    Vec::new()
}

#[mark_route]
pub async fn test(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, test!");
    Vec::new()
}

#[mark_route]
pub async fn test1(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, test!");
    Vec::new()
}

#[mark_route]
pub async fn ask(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, entry!");
    Vec::new()
}

#[mark_route]
pub async fn question(arg: Vec<u8>) -> Vec<u8> {
    println!("Hello, entry!");
    Vec::new()
}
