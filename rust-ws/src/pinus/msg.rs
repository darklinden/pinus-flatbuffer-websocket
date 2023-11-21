use anyhow::{Ok, Result};

const MSG_FLAG_BYTES: usize = 1;
const MSG_ROUTE_CODE_BYTES: usize = 2;

const MSG_ROUTE_LEN_BYTES: usize = 1;
const MSG_ROUTE_CODE_MAX: u16 = 0xffff;
const MSG_COMPRESS_ROUTE_MASK: u8 = 0x1;

const MSG_TYPE_MASK: u8 = 0x7;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum MsgType {
    Request = 0,
    Notify = 1,
    Response = 2,
    Push = 3,
    Unknown = 0xff,
}

impl From<u8> for MsgType {
    fn from(v: u8) -> Self {
        match v {
            0 => MsgType::Request,
            1 => MsgType::Notify,
            2 => MsgType::Response,
            3 => MsgType::Push,
            _ => MsgType::Unknown,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Route {
    pub code: Option<u16>,
    pub name: Option<String>,
}

#[derive(Clone)]
pub struct Msg {
    pub id: i32,
    pub msg_type: MsgType,
    pub route: Route,
    pub body: Option<Vec<u8>>,
}

impl std::fmt::Debug for Msg {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.body.is_none() {
            write!(
                f,
                "Msg {{ id: {}, msg_type: {:?}, route: {:?}, body: None }}",
                self.id, self.msg_type, self.route
            )?;
        } else {
            write!(
                f,
                "Msg {{ id: {}, msg_type: {:?}, route: {:?}, body: Some([",
                self.id, self.msg_type, self.route
            )?;

            let body_bytes = self.body.as_ref().unwrap();
            for i in 0..body_bytes.len() {
                if i != 0 {
                    write!(f, " ")?;
                }
                let byte = body_bytes[i];
                f.write_fmt(format_args!("{:02x}", byte))?;
            }

            write!(f, "]) }}")?;
        }

        std::result::Result::Ok(())
    }
}

// impl std::fmt::Debug for Vec<u8> {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         f.debug_tuple("")
//             .field(&self.id)
//             .field(&self.msg_type)
//             .field(&self.route)
//             .field()
//             .finish()
//     }
// }

impl Msg {
    fn msg_has_id(type_: u8) -> bool {
        type_ == MsgType::Request as u8 || type_ == MsgType::Response as u8
    }

    fn has_id(&self) -> bool {
        Self::msg_has_id(self.msg_type as u8)
    }

    fn msg_has_route(type_: u8) -> bool {
        type_ == MsgType::Request as u8
            || type_ == MsgType::Notify as u8
            || type_ == MsgType::Push as u8
    }

    fn has_route(&self) -> bool {
        Self::msg_has_route(self.msg_type as u8)
    }

    fn caculate_msg_id_bytes(&self) -> usize {
        if !self.has_id() {
            return 0;
        }
        let id = self.id.clone();
        let mut len = 0;
        let mut id = id;
        loop {
            len += 1;
            id >>= 7;
            if id <= 0 {
                break;
            }
        }
        len
    }

    fn encode_msg_flag(&self, buffer: &mut Vec<u8>, offset: usize) -> Result<usize> {
        let msg_type = self.msg_type as u8;

        if self.has_route() && self.route.code.is_some() {
            buffer[offset] = (msg_type << 1) | 1;
            Ok(offset + MSG_FLAG_BYTES)
        } else {
            buffer[offset] = msg_type << 1 | 0;
            Ok(offset + MSG_FLAG_BYTES)
        }
    }

    fn encode_msg_id(&self, buffer: &mut [u8], offset: usize) -> usize {
        let mut id = self.id;
        let mut offset = offset;
        loop {
            let tmp = id % 128;
            let next = id / 128;

            let tmp = if next != 0 { tmp + 128 } else { tmp };
            buffer[offset] = tmp as u8;
            offset += 1;

            id = next;
            if id == 0 {
                break;
            }
        }
        offset
    }

    fn encode_msg_route(&self, buffer: &mut [u8], offset: usize) -> Result<usize> {
        if self.has_route() {
            if self.route.code.is_some() {
                let route_code = self.route.code.unwrap();
                if route_code > MSG_ROUTE_CODE_MAX {
                    return Err(anyhow::anyhow!(
                        "route code length is overflow {}",
                        route_code
                    ));
                }

                buffer[offset] = ((route_code >> 8) & 0xff) as u8;
                buffer[offset + 1] = (route_code & 0xff) as u8;
                Ok(offset + 2)
            } else {
                if self.route.name.is_some() {
                    let route_str = self.route.name.as_ref().unwrap();
                    if route_str.len() > 255 {
                        return Err(anyhow::anyhow!(
                            "route name length is overflow {}",
                            route_str
                        ));
                    }
                    buffer[offset] = route_str.len() as u8;

                    let route_bytes = route_str.as_bytes();
                    buffer[offset + 1..offset + 1 + route_bytes.len()].copy_from_slice(route_bytes);

                    Ok(offset + 1 + route_bytes.len())
                } else {
                    buffer[offset] = 0;
                    Ok(offset + 1)
                }
            }
        } else {
            buffer[offset] = 0;
            Ok(offset + 1)
        }
    }

    /**
     * Message protocol encode.
     *
     * @param  {Number} id            message id
     * @param  {Number} msg_type          message msg_type
     * @param  {Number} compressRoute whether compress route
     * @param  {Number|String} route  route code or route string
     * @param  {Buffer} msg           message body bytes
     * @return {Buffer}               encode result
     */
    pub fn encode(&self) -> Result<Vec<u8>> {
        // calculate message max length
        let id_bytes = self.caculate_msg_id_bytes();

        let mut msg_len: usize = MSG_FLAG_BYTES + id_bytes;
        if self.has_route() {
            let route = self.route.to_owned();
            if self.route.code.is_some() {
                msg_len += MSG_ROUTE_CODE_BYTES;
            } else {
                msg_len += MSG_ROUTE_LEN_BYTES;
                if let Some(route_name) = route.name {
                    let route_bytes = route_name.as_bytes();
                    if route_bytes.len() > 255 {
                        return Err(anyhow::anyhow!(
                            "route name length is overflow {}",
                            route_name
                        ));
                    }
                    msg_len += route_bytes.len();
                }
            }
        }
        if self.body.is_some() {
            msg_len += self.body.as_ref().unwrap().len();
        }
        let mut buffer = vec![0; msg_len];
        let mut offset = 0;

        // add flag
        offset = self.encode_msg_flag(&mut buffer, offset)?;

        // add message id
        if self.has_id() {
            offset = self.encode_msg_id(&mut buffer, offset);
        }

        // add route
        if self.has_route() {
            offset = self.encode_msg_route(&mut buffer, offset)?;
        }

        // add body
        if self.body.is_some() {
            let body_ref = self.body.as_ref().unwrap();
            buffer[offset..offset + body_ref.len()].copy_from_slice(body_ref);
        }

        Ok(buffer)
    }

    /**
     * Message protocol decode.
     *
     * @param  {Buffer|Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
    pub fn decode(buffer: &[u8]) -> Result<Msg> {
        let bytes = buffer.to_vec();
        let mut offset = 0;
        let mut id: i32 = 0;

        // parse flag
        let flag = bytes[offset];
        offset += 1;
        let compress_route = flag & MSG_COMPRESS_ROUTE_MASK;
        let msg_type = (flag >> 1) & MSG_TYPE_MASK;

        // parse id
        if Self::msg_has_id(msg_type) {
            let mut m: u8;
            let mut i = 0;
            loop {
                m = bytes[offset].try_into().unwrap();
                id += ((m & 0x7f) << (7 * i)) as i32;
                offset += 1;
                i += 1;
                if m < 128 {
                    break;
                }
            }
        }

        // parse route
        let route: Route;
        if Self::msg_has_route(msg_type) {
            if compress_route != 0 {
                let route_bytes: [u8; 2] = bytes[offset..offset + 2].try_into().unwrap();
                route = Route {
                    code: Some(u16::from_be_bytes(route_bytes)),
                    name: None,
                };
                offset += 2;
            } else {
                let route_len = bytes[offset] as usize;
                offset += 1;
                if route_len != 0 {
                    let route_bytes = bytes[offset..offset + route_len].to_vec();
                    route = Route {
                        code: None,
                        name: Some(String::from_utf8(route_bytes).unwrap()),
                    };
                    offset += route_len;
                } else {
                    route = Route {
                        code: None,
                        name: None,
                    };
                }
            }
        } else {
            route = Route {
                code: None,
                name: None,
            };
        }

        // parse body
        let body = bytes[offset..].to_vec();

        Ok(Msg {
            id,
            msg_type: msg_type.into(),
            route,
            body: Some(body),
        })
    }
}
