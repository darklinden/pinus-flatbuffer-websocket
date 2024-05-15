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
pub enum RequestUserHelloOffset {}
#[derive(Copy, Clone, PartialEq)]

pub struct RequestUserHello<'a> {
  pub _tab: flatbuffers::Table<'a>,
}

impl<'a> flatbuffers::Follow<'a> for RequestUserHello<'a> {
  type Inner = RequestUserHello<'a>;
  #[inline]
  unsafe fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
    Self { _tab: flatbuffers::Table::new(buf, loc) }
  }
}

impl<'a> RequestUserHello<'a> {

  pub const fn get_fully_qualified_name() -> &'static str {
    "Proto.RequestUserHello"
  }

  #[inline]
  pub unsafe fn init_from_table(table: flatbuffers::Table<'a>) -> Self {
    RequestUserHello { _tab: table }
  }
  #[allow(unused_mut)]
  pub fn create<'bldr: 'args, 'args: 'mut_bldr, 'mut_bldr, A: flatbuffers::Allocator + 'bldr>(
    _fbb: &'mut_bldr mut flatbuffers::FlatBufferBuilder<'bldr, A>,
    _args: &'args RequestUserHelloArgs
  ) -> flatbuffers::WIPOffset<RequestUserHello<'bldr>> {
    let mut builder = RequestUserHelloBuilder::new(_fbb);
    builder.finish()
  }

  pub fn unpack(&self) -> RequestUserHelloT {
    RequestUserHelloT {
    }
  }
}

impl flatbuffers::Verifiable for RequestUserHello<'_> {
  #[inline]
  fn run_verifier(
    v: &mut flatbuffers::Verifier, pos: usize
  ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
    use self::flatbuffers::Verifiable;
    v.visit_table(pos)?
     .finish();
    Ok(())
  }
}
pub struct RequestUserHelloArgs {
}
impl<'a> Default for RequestUserHelloArgs {
  #[inline]
  fn default() -> Self {
    RequestUserHelloArgs {
    }
  }
}

pub struct RequestUserHelloBuilder<'a: 'b, 'b, A: flatbuffers::Allocator + 'a> {
  fbb_: &'b mut flatbuffers::FlatBufferBuilder<'a, A>,
  start_: flatbuffers::WIPOffset<flatbuffers::TableUnfinishedWIPOffset>,
}
impl<'a: 'b, 'b, A: flatbuffers::Allocator + 'a> RequestUserHelloBuilder<'a, 'b, A> {
  #[inline]
  pub fn new(_fbb: &'b mut flatbuffers::FlatBufferBuilder<'a, A>) -> RequestUserHelloBuilder<'a, 'b, A> {
    let start = _fbb.start_table();
    RequestUserHelloBuilder {
      fbb_: _fbb,
      start_: start,
    }
  }
  #[inline]
  pub fn finish(self) -> flatbuffers::WIPOffset<RequestUserHello<'a>> {
    let o = self.fbb_.end_table(self.start_);
    flatbuffers::WIPOffset::new(o.value())
  }
}

impl core::fmt::Debug for RequestUserHello<'_> {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    let mut ds = f.debug_struct("RequestUserHello");
      ds.finish()
  }
}
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq)]
pub struct RequestUserHelloT {
}
impl Default for RequestUserHelloT {
  fn default() -> Self {
    Self {
    }
  }
}
impl RequestUserHelloT {
  pub fn pack<'b, A: flatbuffers::Allocator + 'b>(
    &self,
    _fbb: &mut flatbuffers::FlatBufferBuilder<'b, A>
  ) -> flatbuffers::WIPOffset<RequestUserHello<'b>> {
    RequestUserHello::create(_fbb, &RequestUserHelloArgs{
    })
  }
}