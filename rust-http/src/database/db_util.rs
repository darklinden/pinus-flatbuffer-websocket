pub trait FromEnt<T>: Sized {
    fn from_ent(v: &T) -> Self;
}
