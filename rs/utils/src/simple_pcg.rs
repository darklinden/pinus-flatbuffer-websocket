/**
https://zh.wikipedia.org/zh-cn/%E7%BD%AE%E6%8D%A2%E5%90%8C%E4%BD%99%E7%94%9F%E6%88%90%E5%99%A8
置换同余生成器，简称PCG（英语：Permuted congruential generator）是一个用于产生伪随机数的算法，开发于2014年。
该算法在线性同余生成器（LCG）的基础上增加了输出置换函数（output permutation function），以此优化LCG算法的统计性能。
因此，PCG算法在拥有出色的统计性能的同时[1][2]，也拥有LCG算法代码小、速度快、状态小的特性。[3]

置换同余生成器（PCG）和线性同余生成器（LCG）的差别有三点，在于：
    * LCG的模数以及状态大小比较大，状态大小一般为输出大小的二倍。
    * PCG的核心使用2的N次幂作为模数，以此实现一个非常高效的全周期、无偏差的伪随机数生成器，
    * PCG的状态不会被直接输出，而是经过输出置换函数计算后才输出。
    * 使用2的N次幂作为模数的LCG算法，普遍出现输出低位周期短小的问题，而PCG通过输出置换函数解决了这个问题。

https://www.pcg-random.org/

 */
use super::rand_provider::IRandomProvider;

pub struct SimplePCG {
    start_seed: u64,
    current_seeds: Vec<u64>,
    inc: u64,
}

impl SimplePCG {
    pub fn new(inc: u64, seed: u64) -> Self {
        let mut pcg = SimplePCG {
            start_seed: seed,
            current_seeds: vec![],
            inc,
        };
        pcg.random_f32();
        pcg
    }

    fn get_current_seed(&mut self, index: usize) -> u64 {
        if index < self.current_seeds.len() {
            return self.current_seeds[index];
        }

        let mut old_seed = if !self.current_seeds.is_empty() {
            self.current_seeds[self.current_seeds.len() - 1]
        } else {
            self.start_seed
        };

        let mut new_seed = old_seed;
        for _i in self.current_seeds.len()..=index {
            new_seed = old_seed.wrapping_mul(6364136223846793005u64) + self.inc;
            self.current_seeds.push(new_seed);
            old_seed = new_seed;
        }

        new_seed
    }

    fn gen(&self, seed: u64) -> f32 {
        let xor: u32 = (seed.wrapping_shr(18) ^ seed).wrapping_shr(27) as u32;
        // println!("xor {} ", xor);
        let rot: u32 = seed.wrapping_shr(59) as u32;
        // println!("rot {} ", rot);
        let ret_left = xor.wrapping_shr(rot);
        // println!("ret_left {} ", ret_left);
        let ret_right = xor.wrapping_shl(64u32 - rot);
        // println!("ret_right {} ", ret_right);
        let ret = ret_left | ret_right;
        let ret = ret as f64 / 0x100000000u64 as f64;
        // println!("ret {} ", ret);
        f32::clamp(ret as f32, 0.0, 1.0)
    }
}

impl IRandomProvider for SimplePCG {
    fn set_seed(&mut self, seed: u64) {
        self.start_seed = seed;
        // 生成一次随机数
        self.random_f32();
    }

    fn get_seed(&self) -> u64 {
        self.start_seed
    }

    fn get_index(&self) -> usize {
        if self.current_seeds.is_empty() {
            usize::max_value()
        } else {
            self.current_seeds.len() - 1
        }
    }

    fn random_f32(&mut self) -> f32 {
        self.random_cache(self.current_seeds.len())
    }

    fn random_cache(&mut self, index: usize) -> f32 {
        let seed = self.get_current_seed(index);
        self.gen(seed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pcg() {
        let mut pcg = SimplePCG::new(1, 1234567890u64);
        for i in 0..20usize {
            println!("{} {}", i, pcg.random_cache(i));
        }
        // assert!(false);
    }
}
