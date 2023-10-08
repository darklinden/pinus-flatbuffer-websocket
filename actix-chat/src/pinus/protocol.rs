use super::error::PinusErr;

const PKG_HEAD_BYTES: usize = 4;
const MSG_FLAG_BYTES: usize = 1;
const MSG_ROUTE_CODE_BYTES: usize = 2;
const MSG_ID_MAX_BYTES: usize = 5;
const MSG_ROUTE_LEN_BYTES: usize = 1;
const MSG_ROUTE_CODE_MAX: u16 = 0xffff;
const MSG_COMPRESS_ROUTE_MASK: u8 = 0x1;
const MSG_COMPRESS_GZIP_MASK: u8 = 0x1;
const MSG_COMPRESS_GZIP_ENCODE_MASK: u8 = 1 << 4;
const MSG_TYPE_MASK: u8 = 0x7;
const MSG_TYPE_REQUEST: u8 = 0;
const MSG_TYPE_NOTIFY: u8 = 1;
const MSG_TYPE_RESPONSE: u8 = 2;
const MSG_TYPE_PUSH: u8 = 3;
pub const PACKAGE_TYPE_HANDSHAKE: u8 = 1;
pub const PACKAGE_TYPE_HANDSHAKE_ACK: u8 = 2;
pub const PACKAGE_TYPE_HEARTBEAT: u8 = 3;
pub const PACKAGE_TYPE_DATA: u8 = 4;
pub const PACKAGE_TYPE_KICK: u8 = 5;

#[derive(Debug, Clone)]
pub struct Route {
    pub code: Option<u16>,
    pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct Msg {
    pub id: i32,
    pub msg_type: u8,
    pub compress_route: bool,
    pub route: Option<Route>,
    pub body: Option<Vec<u8>>,
}

#[derive(Debug, Clone)]
pub enum PkgBody {
    Msg(Msg),
    StrMsg(String),
}

#[derive(actix::Message, Clone)]
#[rtype(result = "()")]
pub struct Pkg {
    pub pkg_type: u8,
    pub content: Option<PkgBody>,
}

fn copy_array(dest: &mut [u8], doffset: usize, src: &[u8], soffset: usize, length: usize) {
    for index in 0..length {
        dest[doffset + index] = src[soffset + index];
    }
}

fn msg_has_id(type_: u8) -> bool {
    type_ == MSG_TYPE_REQUEST || type_ == MSG_TYPE_RESPONSE
}

fn msg_has_route(type_: u8) -> bool {
    type_ == MSG_TYPE_REQUEST || type_ == MSG_TYPE_NOTIFY || type_ == MSG_TYPE_PUSH
}

fn caculate_msg_id_bytes(id: i32) -> usize {
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

fn encode_msg_id(id: i32, buffer: &mut [u8], offset: usize) -> usize {
    let mut id = id;
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

fn encode_msg_route(
    compress_route: bool,
    route: &Route,
    buffer: &mut [u8],
    offset: usize,
) -> Result<usize, PinusErr> {
    if compress_route {
        let route_code = route.code.unwrap();
        if route_code > MSG_ROUTE_CODE_MAX {
            return Err(PinusErr {
                msg: "route maxlength is overflow".to_string(),
            });
        }

        buffer[offset] = ((route_code >> 8) & 0xff) as u8;
        buffer[offset + 1] = (route_code & 0xff) as u8;
        Ok(offset + 2)
    } else {
        if route.name.is_some() {
            let route_str = route.name.as_ref().unwrap();
            if route_str.len() > 255 {
                return Err(PinusErr {
                    msg: "route maxlength is overflow".to_string(),
                });
            }
            buffer[offset] = route_str.len() as u8;
            copy_array(buffer, offset + 1, route_str.as_bytes(), 0, route_str.len());
            Ok(offset + 1 + route_str.len())
        } else {
            buffer[offset] = 0;
            Ok(offset + 1)
        }
    }
}

fn encode_msg_body(msg: &[u8], buffer: &mut [u8], offset: usize) -> usize {
    copy_array(buffer, offset, msg, 0, msg.len());
    offset + msg.len()
}

fn encode_msg_flag(
    msg_type: u8,
    compress_route: bool,
    buffer: &mut Vec<u8>,
    offset: usize,
) -> Result<usize, PinusErr> {
    if msg_type != MSG_TYPE_REQUEST
        && msg_type != MSG_TYPE_NOTIFY
        && msg_type != MSG_TYPE_RESPONSE
        && msg_type != MSG_TYPE_PUSH
    {
        return Err(PinusErr {
            msg: format!("msg_encode_flag unkonw message type: {}", msg_type),
        });
    }

    buffer[offset] = (msg_type << 1) | (if compress_route { 1 } else { 0 });

    Ok(offset + MSG_FLAG_BYTES)
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
fn encode_msg(msg: &Msg) -> Result<Vec<u8>, PinusErr> {
    // calculate message max length
    let id_bytes = if msg_has_id(msg.msg_type) {
        caculate_msg_id_bytes(msg.id)
    } else {
        0
    };
    let mut msg_len: usize = MSG_FLAG_BYTES + id_bytes;
    if msg_has_route(msg.msg_type) {
        if msg.compress_route {
            if msg.route.as_ref().unwrap().name.is_some() {
                return Err(PinusErr {
                    msg: "error flag for number route!".to_string(),
                });
            }
            msg_len += MSG_ROUTE_CODE_BYTES;
        } else {
            msg_len += MSG_ROUTE_LEN_BYTES;
            if let Some(route) = msg.route.as_ref().unwrap().name.as_ref() {
                let route_bytes = route.as_bytes();
                if route_bytes.len() > 255 {
                    return Err(PinusErr {
                        msg: "route maxlength is overflow".to_string(),
                    });
                }
                msg_len += route_bytes.len();
            }
        }
    }
    if msg.body.is_some() {
        msg_len += msg.body.as_ref().unwrap().len();
    }
    let mut buffer = vec![0; msg_len];
    let mut offset = 0;
    // add flag
    offset = encode_msg_flag(msg.msg_type, msg.compress_route, &mut buffer, offset).unwrap();

    // add message id
    if msg_has_id(msg.msg_type) {
        offset = encode_msg_id(msg.id, &mut buffer, offset);
    }

    // add route
    if msg_has_route(msg.msg_type) {
        offset = encode_msg_route(
            msg.compress_route,
            &msg.route.as_ref().unwrap(),
            &mut buffer,
            offset,
        )
        .unwrap();
    }

    // add body
    if msg.body.is_some() {
        encode_msg_body(&msg.body.as_ref().unwrap(), &mut buffer, offset);
    }
    Ok(buffer)
}

/**
 * Message protocol decode.
 *
 * @param  {Buffer|Uint8Array} buffer message bytes
 * @return {Object}            message object
 */
fn decode_msg(buffer: &[u8]) -> Result<Msg, &'static str> {
    let bytes = buffer.to_vec();
    let mut offset = 0;
    let mut id: i32 = 0;

    // parse flag
    let flag = bytes[offset];
    offset += 1;
    let compress_route = flag & MSG_COMPRESS_ROUTE_MASK;
    let msg_type = (flag >> 1) & MSG_TYPE_MASK;

    // parse id
    if msg_has_id(msg_type) {
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
    let mut route: Option<Route> = None;
    if msg_has_route(msg_type) {
        if compress_route != 0 {
            let route_bytes: [u8; 2] = bytes[offset..offset + 2].try_into().unwrap();
            route = Some(Route {
                code: Some(u16::from_be_bytes(route_bytes)),
                name: None,
            });
            offset += 2;
        } else {
            let route_len = bytes[offset] as usize;
            offset += 1;
            if route_len != 0 {
                let route_bytes = bytes[offset..offset + route_len].to_vec();
                route = Some(Route {
                    code: None,
                    name: Some(String::from_utf8(route_bytes).unwrap()),
                });
                offset += route_len;
            } else {
                route = None;
            }
        }
    }

    // parse body
    let body = bytes[offset..].to_vec();

    Ok(Msg {
        id,
        msg_type,
        compress_route: compress_route != 0,
        route,
        body: Some(body),
    })
}

fn is_valid_pkg_type(type_: u8) -> bool {
    type_ >= PACKAGE_TYPE_HANDSHAKE && type_ <= PACKAGE_TYPE_KICK
}

/**
 * Package protocol encode.
 *
 * Pomelo package format:
 * +------+-------------+------------------+
 * | type | body length |       body       |
 * +------+-------------+------------------+
 *
 * Head: 4bytes
 *   0: package type,
 *      1 - handshake,
 *      2 - handshake ack,
 *      3 - heartbeat,
 *      4 - data
 *      5 - kick
 *   1 - 3: big-endian body length
 * Body: body length bytes
 *
 * @param  {Number}    type   package type
 * @param  {Uint8Array} body   body content in bytes
 * @return {Uint8Array}        new byte array that contains encode result
 */
#[allow(dead_code)]
pub fn encode_pkg(pkg: &Pkg) -> Result<Vec<u8>, PinusErr> {
    let mut body: Option<Vec<u8>> = None;
    if pkg.content.is_some() {
        match pkg.content.as_ref().unwrap() {
            PkgBody::Msg(msg) => {
                body = encode_msg(msg).ok();
            }
            PkgBody::StrMsg(handshake) => {
                body = Some(handshake.as_bytes().to_vec());
            }
        }
    }

    let length = if body.is_some() {
        body.as_ref().unwrap().len()
    } else {
        0
    };
    let mut buffer = Vec::with_capacity(PKG_HEAD_BYTES + length);
    buffer.push(pkg.pkg_type);
    buffer.push((length >> 16) as u8);
    buffer.push((length >> 8) as u8);
    buffer.push(length as u8);
    if body.as_ref().is_some() {
        buffer.extend_from_slice(&body.unwrap());
    }
    Ok(buffer)
}

/**
 * Package protocol decode.
 * See encode for package format.
 *
 * @param  {Uint8Array} buffer byte array containing package content
 * @return {Object}           {type: package type, buffer: body byte array}
 */
#[allow(dead_code)]
pub fn decode_pkg(buffer: &[u8]) -> Result<Vec<Pkg>, PinusErr> {
    let mut offset = 0;
    let bytes = buffer.to_vec();
    let mut length: usize;
    let mut rs: Vec<Pkg> = Vec::new();
    while offset < bytes.len() {
        let pkg_type = bytes[offset];
        offset += 1;
        length = ((bytes[offset] as u32) << 16
            | (bytes[offset + 1] as u32) << 8
            | bytes[offset + 2] as u32) as usize;
        offset += 3;
        if !is_valid_pkg_type(pkg_type) || length > bytes.len() {
            // return invalid type, then disconnect!
            return Ok(vec![Pkg {
                pkg_type: pkg_type,
                content: None,
            }]);
        }
        let body = if length > 0 {
            Some(bytes[offset..offset + length].to_vec())
        } else {
            None
        };
        offset += length;

        match pkg_type {
            PACKAGE_TYPE_DATA => {
                rs.push(Pkg {
                    pkg_type,
                    content: if body.is_some() {
                        decode_msg(body.as_ref().unwrap())
                            .ok()
                            .map(|msg| PkgBody::Msg(msg))
                    } else {
                        None
                    },
                });
            }
            _ => {
                rs.push(Pkg {
                    pkg_type,
                    content: if body.is_some() {
                        Some(PkgBody::StrMsg(String::from_utf8(body.unwrap()).unwrap()))
                    } else {
                        None
                    },
                });
            }
        }
    }
    Ok(rs)
}
