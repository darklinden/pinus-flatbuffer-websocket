#![deny(clippy::all)]
use napi::bindgen_prelude::*;

mod rust_generated;

use crate::rust_generated::proto::{
  ResponseUserEnter, ResponseUserEnterArgs, UserInfo, UserInfoArgs,
};

#[macro_use]
extern crate napi_derive;

#[allow(non_snake_case)]
#[napi]
pub fn rsflat_en_ResponseUserEnter(code: i32, user_name: String, user_level: i32) -> Buffer {
  // Build up a serialized buffer algorithmically.
  // Initialize it with a capacity of 1024 bytes.
  let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

  let name = builder.create_string(&user_name);

  let user_info_offset = UserInfo::create(
    &mut builder,
    &UserInfoArgs {
      name: Some(name),
      level: user_level,
    },
  );

  let response_user_enter = ResponseUserEnter::create(
    &mut builder,
    &ResponseUserEnterArgs {
      code: code,
      user: Some(user_info_offset),
    },
  );

  builder.finish(response_user_enter, None);

  let buf = builder.finished_data(); // Of type `&[u8]`
  return buf.into();
}
