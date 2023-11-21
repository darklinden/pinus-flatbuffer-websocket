use std::fmt::Display;

use anyhow::Result;

use super::msg::Msg;

#[derive(Debug, Clone)]
pub enum PkgBody {
    None,
    Msg(Msg),
    StrMsg(String),
}

#[derive(Clone, Copy, Debug)]
#[repr(u8)]
pub enum PkgType {
    Unknown = 0u8,
    Handshake = 1u8,
    HandshakeAck = 2u8,
    Heartbeat = 3u8,
    Data = 4u8,
    Kick = 5u8,
}

impl From<u8> for PkgType {
    fn from(v: u8) -> Self {
        match v {
            1 => PkgType::Handshake,
            2 => PkgType::HandshakeAck,
            3 => PkgType::Heartbeat,
            4 => PkgType::Data,
            5 => PkgType::Kick,
            _ => PkgType::Unknown,
        }
    }
}

impl Display for PkgType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            PkgType::Unknown => "Unknown",
            PkgType::Handshake => "Handshake",
            PkgType::HandshakeAck => "HandshakeAck",
            PkgType::Heartbeat => "Heartbeat",
            PkgType::Data => "Data",
            PkgType::Kick => "Kick",
        };
        write!(f, "{}", s)
    }
}

#[derive(actix::Message, Clone, Debug)]
#[rtype(result = "()")]
pub struct Pkg {
    pub pkg_type: PkgType,
    pub content: PkgBody,
}

impl Pkg {
    fn is_valid_pkg_type(pkg_type: u8) -> bool {
        pkg_type >= PkgType::Handshake as u8 && pkg_type <= PkgType::Kick as u8
    }

    #[allow(dead_code)]
    fn is_valid(&self) -> bool {
        Self::is_valid_pkg_type(self.pkg_type as u8)
    }

    pub const PKG_HEAD_BYTES: usize = 4;

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
    pub fn encode(&self) -> Result<Vec<u8>> {
        let body: Option<Vec<u8>>;
        let content = &self.content;

        match content {
            PkgBody::None => {
                body = None;
            }
            PkgBody::Msg(msg) => {
                body = Some(msg.encode()?);
            }
            PkgBody::StrMsg(str_msg) => {
                body = Some(str_msg.as_bytes().to_vec());
            }
        }

        let length = if body.is_some() {
            body.as_ref().unwrap().len()
        } else {
            0
        };
        let mut buffer = Vec::with_capacity(Self::PKG_HEAD_BYTES + length);
        buffer.push(self.pkg_type as u8);
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
    pub fn decode(buffer: &[u8]) -> Result<Vec<Pkg>> {
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
            if !Self::is_valid_pkg_type(pkg_type) || length > bytes.len() {
                // return invalid type, then disconnect!
                return Ok(vec![Pkg {
                    pkg_type: pkg_type.into(),
                    content: PkgBody::None,
                }]);
            }
            let body = if length > 0 {
                Some(bytes[offset..offset + length].to_vec())
            } else {
                None
            };
            offset += length;

            if pkg_type == PkgType::Data as u8 {
                let msg = Msg::decode(body.as_ref().unwrap())?;
                rs.push(Pkg {
                    pkg_type: pkg_type.into(),
                    content: if body.is_some() {
                        PkgBody::Msg(msg)
                    } else {
                        PkgBody::None
                    },
                });
            } else {
                rs.push(Pkg {
                    pkg_type: pkg_type.into(),
                    content: if body.is_some() {
                        PkgBody::StrMsg(String::from_utf8(body.unwrap()).unwrap())
                    } else {
                        PkgBody::None
                    },
                });
            }
        }
        Ok(rs)
    }
}
