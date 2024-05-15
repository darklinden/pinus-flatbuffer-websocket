/// 从 Orm Model 转换为 Dto
pub trait FromEntTrait<T>: Sized {
    fn from_ent(v: &T) -> Self;
}

/// 从 Dto 转换为 Orm ActiveModel
pub trait ToEntTrait<T> {
    fn to_ent(&self) -> T;
}

/// 保存 Dto
pub trait SaveDtoTrait {
    // 保存到数据库 如果是插入, 则更新主键
    fn db_save<C>(
        &mut self,
        db: &C,
    ) -> impl std::future::Future<Output = anyhow::Result<()>> + Send
    where
        C: sea_orm::ConnectionTrait;

    /// 缓存 Key, 目前只支持 id 主键
    /// 数据库中目前也只有 i64 类型的 主键
    fn cache_key_by_id(id: &i64) -> String;

    /// 保存到 redis 缓存
    /// * 如果尚未有主键, 保存失败, 返回false
    /// * 如果保存成功, 返回true
    /// * 如果执行过程中错误, 返回 Err
    fn cache_save(
        &self,
        rd: &mut redis::aio::ConnectionManager,
    ) -> impl std::future::Future<Output = anyhow::Result<bool>> + Send;

    /// 先保存到数据库, 再保存到缓存, 如果是数据库插入操作, 则更新主键
    fn save<C>(
        &mut self,
        rd: &mut redis::aio::ConnectionManager,
        pg: &C,
    ) -> impl std::future::Future<Output = anyhow::Result<()>> + Send
    where
        C: sea_orm::ConnectionTrait;

    /// 保存到 redis 缓存
    /// * 如果尚未有主键, 保存失败, 返回false
    /// * 如果保存成功, 返回true
    /// * 如果执行过程中错误, 返回 Err
    fn cache_pipeline_save(&self, pipe: &mut redis::Pipeline) -> bool;
}
