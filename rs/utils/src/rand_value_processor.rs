#![allow(dead_code)]

// convert from https://github.com/XJINE/Unity_RandomEx

use super::rand_provider::IRandomProvider;

// value max 255
pub struct IColorLike {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

// value max 1
pub struct IFloatColorLike {
    r: f32,
    g: f32,
    b: f32,
    a: f32,
}

pub struct IRectLike {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

pub struct IVec2Like {
    x: f32,
    y: f32,
}

pub struct IVec3Like {
    x: f32,
    y: f32,
    z: f32,
}

pub struct IVec4Like {
    x: f32,
    y: f32,
    z: f32,
    w: f32,
}

pub struct IAabb {
    center: IVec3Like,
    half_extents: IVec3Like,
}

const RADIAN_MIN: f32 = 0.0;
const RADIAN_MAX: f32 = std::f32::consts::TAU;

pub struct RandValueProcessor<T>
where
    T: IRandomProvider,
{
    random_provider: T,
}

impl<T> RandValueProcessor<T>
where
    T: IRandomProvider,
{
    pub fn new(random_provider: T) -> Self {
        RandValueProcessor { random_provider }
    }

    pub fn value(&mut self) -> f32 {
        // let v = self.random_provider.random_f32();
        // log::debug!(
        //     "RandValueProcessor.value {:?} index {:?} {:?}",
        //     self.random_provider.get_seed(),
        //     self.random_provider.get_index(),
        //     v
        // );
        // v

        self.random_provider.random_f32()
    }

    pub fn value_index(&mut self, index: usize) -> f32 {
        // let v = self.random_provider.random_cache(index);
        // log::debug!(
        //     "RandValueProcessor.value_index {:?} index {:?} {:?}",
        //     self.random_provider.get_seed(),
        //     index,
        //     v
        // );
        // v

        self.random_provider.random_cache(index)
    }

    pub fn range_i64(&mut self, min: i64, max: i64) -> i64 {
        (min as f64 + (max - min + 1) as f64 * self.value() as f64) as i64
    }

    pub fn range_i32(&mut self, min: i32, max: i32) -> i32 {
        self.range_i64(min as i64, max as i64) as i32
    }

    pub fn range_f32(&mut self, min: f32, max: f32) -> f32 {
        min + (max - min) * self.value()
    }

    pub fn range_vec2(&mut self, min: &IVec2Like, max: &IVec2Like) -> IVec2Like {
        IVec2Like {
            x: self.range_f32(min.x, max.x),
            y: self.range_f32(min.y, max.y),
        }
    }

    pub fn range_vec3(&mut self, min: &IVec3Like, max: &IVec3Like) -> IVec3Like {
        IVec3Like {
            x: self.range_f32(min.x, max.x),
            y: self.range_f32(min.y, max.y),
            z: self.range_f32(min.z, max.z),
        }
    }

    pub fn range_vec4(&mut self, min: &IVec4Like, max: &IVec4Like) -> IVec4Like {
        IVec4Like {
            x: self.range_f32(min.x, max.x),
            y: self.range_f32(min.y, max.y),
            z: self.range_f32(min.z, max.z),
            w: self.range_f32(min.w, max.w),
        }
    }

    pub fn point_in_rect(&mut self, rect: &IRectLike) -> IVec2Like {
        let x_min = rect.x;
        let y_min = rect.y;
        let x_max = rect.x + rect.width;
        let y_max = rect.y + rect.height;
        IVec2Like {
            x: self.range_f32(x_min, x_max),
            y: self.range_f32(y_min, y_max),
        }
    }

    pub fn point_in_aabb(&mut self, aabb: &IAabb) -> IVec3Like {
        IVec3Like {
            x: self.range_f32(
                aabb.center.x - aabb.half_extents.x,
                aabb.center.x + aabb.half_extents.x,
            ),
            y: self.range_f32(
                aabb.center.y - aabb.half_extents.y,
                aabb.center.y + aabb.half_extents.y,
            ),
            z: self.range_f32(
                aabb.center.z - aabb.half_extents.z,
                aabb.center.z + aabb.half_extents.z,
            ),
        }
    }

    pub fn color(&mut self) -> IColorLike {
        IColorLike {
            r: self.range_i32(0, 255) as u8,
            g: self.range_i32(0, 255) as u8,
            b: self.range_i32(0, 255) as u8,
            a: self.range_i32(0, 255) as u8,
        }
    }

    pub fn float_color(&mut self) -> IFloatColorLike {
        IFloatColorLike {
            r: self.range_f32(0.0, 1.0),
            g: self.range_f32(0.0, 1.0),
            b: self.range_f32(0.0, 1.0),
            a: self.range_f32(0.0, 1.0),
        }
    }

    pub fn radian(&mut self) -> f32 {
        self.range_f32(RADIAN_MIN, RADIAN_MAX)
    }

    pub fn sign(&mut self) -> i32 {
        if self.range_f32(-1.0, 1.0) > 0.0 {
            1
        } else {
            -1
        }
    }

    pub fn on_unit_circle(&mut self) -> IVec2Like {
        let angle = self.radian();

        IVec2Like {
            x: angle.cos(),
            y: angle.sin(),
        }
    }

    pub fn inside_unit_circle(&mut self) -> IVec2Like {
        let angle = self.radian();
        let radius = self.value();

        IVec2Like {
            x: angle.cos() * radius,
            y: angle.sin() * radius,
        }
    }

    pub fn on_unit_sphere(&mut self) -> IVec3Like {
        let angle1 = self.radian();
        let angle2 = self.radian();

        IVec3Like {
            x: angle1.sin() * angle2.cos(),
            y: angle1.sin() * angle2.sin(),
            z: angle1.cos(),
        }
    }

    pub fn inside_unit_sphere(&mut self) -> IVec3Like {
        let angle1 = self.radian();
        let angle2 = self.radian();
        let radius = self.value();

        IVec3Like {
            x: angle1.sin() * angle2.cos() * radius,
            y: angle1.sin() * angle2.sin() * radius,
            z: angle1.cos() * radius,
        }
    }

    pub fn choice<'a, Ta>(&mut self, list: &'a [Ta]) -> Option<&'a Ta> {
        if !list.is_empty() {
            let index = (list.len() as f32 * self.value()).floor() as usize;
            list.get(index)
        } else {
            None
        }
    }

    pub fn choice_out<Ta>(&mut self, list: &mut Vec<Ta>) -> Option<Ta> {
        if !list.is_empty() {
            let index = (self.value() * list.len() as f32) as usize;
            Some(list.remove(index))
        } else {
            None
        }
    }

    pub fn choice_weight<'a, Ta, F>(
        &mut self,
        list: &'a [Ta],
        total_weight: f32,
        weight_func: F,
    ) -> Option<&'a Ta>
    where
        F: Fn(&Ta) -> f32,
    {
        if !list.is_empty() {
            let weight_rand = self.range_f32(0.0, total_weight);
            let mut accumulated_weight = 0.0;

            for item in list {
                let weight = &weight_func(item);
                if weight_rand <= accumulated_weight + weight {
                    return Some(item);
                }
                accumulated_weight += weight;
            }
        }
        None
    }
}
