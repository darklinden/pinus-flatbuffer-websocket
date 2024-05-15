// automatically generated by the FlatBuffers compiler, do not modify
// @generated
extern crate alloc;
extern crate flatbuffers;
use alloc::boxed::Box;
use alloc::string::{String, ToString};
use alloc::vec::Vec;
use core::mem;
use core::cmp::Ordering;
use self::flatbuffers::{EndianScalar, Follow};
use super::*;
pub enum ResponseUserHelloOffset {}
#[derive(Copy, Clone, PartialEq)]

pub struct ResponseUserHello<'a> {
  pub _tab: flatbuffers::Table<'a>,
}

impl<'a> flatbuffers::Follow<'a> for ResponseUserHello<'a> {
  type Inner = ResponseUserHello<'a>;
  #[inline]
  unsafe fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
    Self { _tab: flatbuffers::Table::new(buf, loc) }
  }
}

impl<'a> ResponseUserHello<'a> {
  pub const VT_CODE: flatbuffers::VOffsetT = 4;
  pub const VT_SAY: flatbuffers::VOffsetT = 6;

  pub const fn get_fully_qualified_name() -> &'static str {
    "Proto.ResponseUserHello"
  }

  #[inline]
  pub unsafe fn init_from_table(table: flatbuffers::Table<'a>) -> Self {
    ResponseUserHello { _tab: table }
  }
  #[allow(unused_mut)]
  pub fn create<'bldr: 'args, 'args: 'mut_bldr, 'mut_bldr, A: flatbuffers::Allocator + 'bldr>(
    _fbb: &'mut_bldr mut flatbuffers::FlatBufferBuilder<'bldr, A>,
    args: &'args ResponseUserHelloArgs<'args>
  ) -> flatbuffers::WIPOffset<ResponseUserHello<'bldr>> {
    let mut builder = ResponseUserHelloBuilder::new(_fbb);
    if let Some(x) = args.say { builder.add_say(x); }
    builder.add_code(args.code);
    builder.finish()
  }

  pub fn unpack(&self) -> ResponseUserHelloT {
    let code = self.code();
    let say = self.say().map(|x| {
      x.to_string()
    });
    ResponseUserHelloT {
      code,
      say,
    }
  }

  #[inline]
  pub fn code(&self) -> i32 {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<i32>(ResponseUserHello::VT_CODE, Some(0)).unwrap()}
  }
  #[inline]
  pub fn say(&self) -> Option<&'a str> {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<flatbuffers::ForwardsUOffset<&str>>(ResponseUserHello::VT_SAY, None)}
  }
}

impl flatbuffers::Verifiable for ResponseUserHello<'_> {
  #[inline]
  fn run_verifier(
    v: &mut flatbuffers::Verifier, pos: usize
  ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
    use self::flatbuffers::Verifiable;
    v.visit_table(pos)?
     .visit_field::<i32>("code", Self::VT_CODE, false)?
     .visit_field::<flatbuffers::ForwardsUOffset<&str>>("say", Self::VT_SAY, false)?
     .finish();
    Ok(())
  }
}
pub struct ResponseUserHelloArgs<'a> {
    pub code: i32,
    pub say: Option<flatbuffers::WIPOffset<&'a str>>,
}
impl<'a> Default for ResponseUserHelloArgs<'a> {
  #[inline]
  fn default() -> Self {
    ResponseUserHelloArgs {
      code: 0,
      say: None,
    }
  }
}

pub struct ResponseUserHelloBuilder<'a: 'b, 'b, A: flatbuffers::Allocator + 'a> {
  fbb_: &'b mut flatbuffers::FlatBufferBuilder<'a, A>,
  start_: flatbuffers::WIPOffset<flatbuffers::TableUnfinishedWIPOffset>,
}
impl<'a: 'b, 'b, A: flatbuffers::Allocator + 'a> ResponseUserHelloBuilder<'a, 'b, A> {
  #[inline]
  pub fn add_code(&mut self, code: i32) {
    self.fbb_.push_slot::<i32>(ResponseUserHello::VT_CODE, code, 0);
  }
  #[inline]
  pub fn add_say(&mut self, say: flatbuffers::WIPOffset<&'b  str>) {
    self.fbb_.push_slot_always::<flatbuffers::WIPOffset<_>>(ResponseUserHello::VT_SAY, say);
  }
  #[inline]
  pub fn new(_fbb: &'b mut flatbuffers::FlatBufferBuilder<'a, A>) -> ResponseUserHelloBuilder<'a, 'b, A> {
    let start = _fbb.start_table();
    ResponseUserHelloBuilder {
      fbb_: _fbb,
      start_: start,
    }
  }
  #[inline]
  pub fn finish(self) -> flatbuffers::WIPOffset<ResponseUserHello<'a>> {
    let o = self.fbb_.end_table(self.start_);
    flatbuffers::WIPOffset::new(o.value())
  }
}

impl core::fmt::Debug for ResponseUserHello<'_> {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    let mut ds = f.debug_struct("ResponseUserHello");
      ds.field("code", &self.code());
      ds.field("say", &self.say());
      ds.finish()
  }
}
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq)]
pub struct ResponseUserHelloT {
  pub code: i32,
  pub say: Option<String>,
}
impl Default for ResponseUserHelloT {
  fn default() -> Self {
    Self {
      code: 0,
      say: None,
    }
  }
}
impl ResponseUserHelloT {
  pub fn pack<'b, A: flatbuffers::Allocator + 'b>(
    &self,
    _fbb: &mut flatbuffers::FlatBufferBuilder<'b, A>
  ) -> flatbuffers::WIPOffset<ResponseUserHello<'b>> {
    let code = self.code;
    let say = self.say.as_ref().map(|x|{
      _fbb.create_string(x)
    });
    ResponseUserHello::create(_fbb, &ResponseUserHelloArgs{
      code,
      say,
    })
  }
}