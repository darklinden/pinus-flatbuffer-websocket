use route_marker::mark_route;

#[derive(Debug)]
pub struct EntryHandler {}


// actix-redis/redis.rs
// impl Handler<Command> for RedisActor {
//     type Result = ResponseFuture<Result<RespValue, Error>>;

//     fn handle(&mut self, msg: Command, _: &mut Self::Context) -> Self::Result {
//         let (tx, rx) = oneshot::channel();
//         if let Some(ref mut cell) = self.cell {
//             self.queue.push_back(tx);
//             cell.write(msg.0);
//         } else {
//             let _ = tx.send(Err(Error::NotConnected));
//         }

//         Box::pin(async move { rx.await.map_err(|_| Error::Disconnected)? })
//     }
// }

// actix-session/src/redis_actor.rs
// #[async_trait::async_trait(?Send)]
// impl SessionStore for RedisActorSessionStore {
//     async fn load(&self, session_key: &SessionKey) -> Result<Option<SessionState>, LoadError> {
//         let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());
//         let val = self
//             .addr
//             .send(Command(resp_array!["GET", cache_key]))
//             .await
//             .map_err(Into::into)
//             .map_err(LoadError::Other)?
//             .map_err(Into::into)
//             .map_err(LoadError::Other)?;

//         match val {
//             RespValue::Error(err) => Err(LoadError::Other(anyhow::anyhow!(err))),

//             RespValue::SimpleString(s) => Ok(serde_json::from_str(&s)
//                 .map_err(Into::into)
//                 .map_err(LoadError::Deserialization)?),

//             RespValue::BulkString(s) => Ok(serde_json::from_slice(&s)
//                 .map_err(Into::into)
//                 .map_err(LoadError::Deserialization)?),

//             _ => Ok(None),
//         }
//     }
// }

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
