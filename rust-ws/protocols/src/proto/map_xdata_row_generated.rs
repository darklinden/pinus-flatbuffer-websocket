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
pub enum MapXDataRowOffset {}
#[derive(Copy, Clone, PartialEq)]

pub struct MapXDataRow<'a> {
  pub _tab: flatbuffers::Table<'a>,
}

impl<'a> flatbuffers::Follow<'a> for MapXDataRow<'a> {
  type Inner = MapXDataRow<'a>;
  #[inline]
  unsafe fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
    Self { _tab: flatbuffers::Table::new(buf, loc) }
  }
}

impl<'a> MapXDataRow<'a> {
  pub const VT_ID: flatbuffers::VOffsetT = 4;
  pub const VT_NAME: flatbuffers::VOffsetT = 6;
  pub const VT_CAMP1: flatbuffers::VOffsetT = 8;
  pub const VT_CAMP2: flatbuffers::VOffsetT = 10;

  pub const fn get_fully_qualified_name() -> &'static str {
    "Proto.MapXDataRow"
  }

  #[inline]
  pub unsafe fn init_from_table(table: flatbuffers::Table<'a>) -> Self {
    MapXDataRow { _tab: table }
  }
  #[allow(unused_mut)]
  pub fn create<'bldr: 'args, 'args: 'mut_bldr, 'mut_bldr>(
    _fbb: &'mut_bldr mut flatbuffers::FlatBufferBuilder<'bldr>,
    args: &'args MapXDataRowArgs<'args>
  ) -> flatbuffers::WIPOffset<MapXDataRow<'bldr>> {
    let mut builder = MapXDataRowBuilder::new(_fbb);
    if let Some(x) = args.camp2 { builder.add_camp2(x); }
    if let Some(x) = args.camp1 { builder.add_camp1(x); }
    if let Some(x) = args.name { builder.add_name(x); }
    builder.add_id(args.id);
    builder.finish()
  }

  pub fn unpack(&self) -> MapXDataRowT {
    let id = self.id();
    let name = self.name().map(|x| {
      x.to_string()
    });
    let camp1 = self.camp1().map(|x| {
      x.iter().map(|t| t.unpack()).collect()
    });
    let camp2 = self.camp2().map(|x| {
      x.iter().map(|t| t.unpack()).collect()
    });
    MapXDataRowT {
      id,
      name,
      camp1,
      camp2,
    }
  }

  #[inline]
  pub fn id(&self) -> i32 {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<i32>(MapXDataRow::VT_ID, Some(0)).unwrap()}
  }
  #[inline]
  pub fn name(&self) -> Option<&'a str> {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<flatbuffers::ForwardsUOffset<&str>>(MapXDataRow::VT_NAME, None)}
  }
  #[inline]
  pub fn camp1(&self) -> Option<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3<'a>>>> {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3>>>>(MapXDataRow::VT_CAMP1, None)}
  }
  #[inline]
  pub fn camp2(&self) -> Option<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3<'a>>>> {
    // Safety:
    // Created from valid Table for this object
    // which contains a valid value in this slot
    unsafe { self._tab.get::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3>>>>(MapXDataRow::VT_CAMP2, None)}
  }
}

impl flatbuffers::Verifiable for MapXDataRow<'_> {
  #[inline]
  fn run_verifier(
    v: &mut flatbuffers::Verifier, pos: usize
  ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
    use self::flatbuffers::Verifiable;
    v.visit_table(pos)?
     .visit_field::<i32>("id", Self::VT_ID, false)?
     .visit_field::<flatbuffers::ForwardsUOffset<&str>>("name", Self::VT_NAME, false)?
     .visit_field::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'_, flatbuffers::ForwardsUOffset<Vec3>>>>("camp1", Self::VT_CAMP1, false)?
     .visit_field::<flatbuffers::ForwardsUOffset<flatbuffers::Vector<'_, flatbuffers::ForwardsUOffset<Vec3>>>>("camp2", Self::VT_CAMP2, false)?
     .finish();
    Ok(())
  }
}
pub struct MapXDataRowArgs<'a> {
    pub id: i32,
    pub name: Option<flatbuffers::WIPOffset<&'a str>>,
    pub camp1: Option<flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3<'a>>>>>,
    pub camp2: Option<flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<Vec3<'a>>>>>,
}
impl<'a> Default for MapXDataRowArgs<'a> {
  #[inline]
  fn default() -> Self {
    MapXDataRowArgs {
      id: 0,
      name: None,
      camp1: None,
      camp2: None,
    }
  }
}

pub struct MapXDataRowBuilder<'a: 'b, 'b> {
  fbb_: &'b mut flatbuffers::FlatBufferBuilder<'a>,
  start_: flatbuffers::WIPOffset<flatbuffers::TableUnfinishedWIPOffset>,
}
impl<'a: 'b, 'b> MapXDataRowBuilder<'a, 'b> {
  #[inline]
  pub fn add_id(&mut self, id: i32) {
    self.fbb_.push_slot::<i32>(MapXDataRow::VT_ID, id, 0);
  }
  #[inline]
  pub fn add_name(&mut self, name: flatbuffers::WIPOffset<&'b  str>) {
    self.fbb_.push_slot_always::<flatbuffers::WIPOffset<_>>(MapXDataRow::VT_NAME, name);
  }
  #[inline]
  pub fn add_camp1(&mut self, camp1: flatbuffers::WIPOffset<flatbuffers::Vector<'b , flatbuffers::ForwardsUOffset<Vec3<'b >>>>) {
    self.fbb_.push_slot_always::<flatbuffers::WIPOffset<_>>(MapXDataRow::VT_CAMP1, camp1);
  }
  #[inline]
  pub fn add_camp2(&mut self, camp2: flatbuffers::WIPOffset<flatbuffers::Vector<'b , flatbuffers::ForwardsUOffset<Vec3<'b >>>>) {
    self.fbb_.push_slot_always::<flatbuffers::WIPOffset<_>>(MapXDataRow::VT_CAMP2, camp2);
  }
  #[inline]
  pub fn new(_fbb: &'b mut flatbuffers::FlatBufferBuilder<'a>) -> MapXDataRowBuilder<'a, 'b> {
    let start = _fbb.start_table();
    MapXDataRowBuilder {
      fbb_: _fbb,
      start_: start,
    }
  }
  #[inline]
  pub fn finish(self) -> flatbuffers::WIPOffset<MapXDataRow<'a>> {
    let o = self.fbb_.end_table(self.start_);
    flatbuffers::WIPOffset::new(o.value())
  }
}

impl core::fmt::Debug for MapXDataRow<'_> {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    let mut ds = f.debug_struct("MapXDataRow");
      ds.field("id", &self.id());
      ds.field("name", &self.name());
      ds.field("camp1", &self.camp1());
      ds.field("camp2", &self.camp2());
      ds.finish()
  }
}
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq)]
pub struct MapXDataRowT {
  pub id: i32,
  pub name: Option<String>,
  pub camp1: Option<Vec<Vec3T>>,
  pub camp2: Option<Vec<Vec3T>>,
}
impl Default for MapXDataRowT {
  fn default() -> Self {
    Self {
      id: 0,
      name: None,
      camp1: None,
      camp2: None,
    }
  }
}
impl MapXDataRowT {
  pub fn pack<'b>(
    &self,
    _fbb: &mut flatbuffers::FlatBufferBuilder<'b>
  ) -> flatbuffers::WIPOffset<MapXDataRow<'b>> {
    let id = self.id;
    let name = self.name.as_ref().map(|x|{
      _fbb.create_string(x)
    });
    let camp1 = self.camp1.as_ref().map(|x|{
      let w: Vec<_> = x.iter().map(|t| t.pack(_fbb)).collect();_fbb.create_vector(&w)
    });
    let camp2 = self.camp2.as_ref().map(|x|{
      let w: Vec<_> = x.iter().map(|t| t.pack(_fbb)).collect();_fbb.create_vector(&w)
    });
    MapXDataRow::create(_fbb, &MapXDataRowArgs{
      id,
      name,
      camp1,
      camp2,
    })
  }
}
