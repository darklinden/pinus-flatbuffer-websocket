// 用于标记当前执行的是什么类型的操作

export enum RunType {
    Unknown, // 未知
    TestUpgrade, // 测试升级
    Upgrade, // 升级
    TestForceRecreate, // 测试强制重建
    ForceRecreate, // 强制重建
}
