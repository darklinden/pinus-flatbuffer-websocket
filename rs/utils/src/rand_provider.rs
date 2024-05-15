pub trait IRandomProvider {
    fn set_seed(&mut self, seed: u64);
    fn get_seed(&self) -> u64;
    fn get_index(&self) -> usize;

    fn random_f32(&mut self) -> f32;
    fn random_cache(&mut self, index: usize) -> f32;
}
