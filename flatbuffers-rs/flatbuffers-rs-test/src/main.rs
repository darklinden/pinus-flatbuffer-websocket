/*
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import the flatbuffers runtime library
extern crate flatbuffers;

// import the generated code
#[allow(dead_code, unused_imports)]
#[allow(clippy::all)]
mod rust_generated;

use crate::rust_generated::proto::{
    ResponseUserEnter, ResponseUserEnterArgs, UserInfo, UserInfoArgs,
};

fn test_encode_decode() {
    // Build up a serialized buffer algorithmically.
    // Initialize it with a capacity of 1024 bytes.
    let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024);

    let name = builder.create_string("hello");

    let user_info_offset = UserInfo::create(
        &mut builder,
        &UserInfoArgs {
            name: Some(name),
            level: 1,
        },
    );

    let response_user_enter = ResponseUserEnter::create(
        &mut builder,
        &ResponseUserEnterArgs {
            code: 0,
            user: Some(user_info_offset),
        },
    );

    builder.finish(response_user_enter, None);

    let buf = builder.finished_data(); // Of type `&[u8]`

    // Get access to the root:
    let resp = flatbuffers::root::<ResponseUserEnter>(buf).unwrap();
}

// Example how to use FlatBuffers to create and read binary buffers.
#[allow(clippy::float_cmp)]
fn main() {
    let now = chrono::Utc::now().timestamp_millis();

    let test_count = 1000000;
    for _ in 1..test_count {
        test_encode_decode();
    }

    let end = chrono::Utc::now().timestamp_millis();

    println!("test_encode_decode {} times, cost {} ms", test_count, end - now);
}

#[cfg(test)]
#[test]
fn test_main() {
    main()
}
