# Game Server Rust
> game-server-rust

## 关于

* 游戏 Websocket 服务器
* 包含读取 flatbuffers 的 bytes 配置数据
* 包含网络发送和接收 flatbuffers 数据
* 基于 [Actix](https://github.com/actix/actix) 构建

## 工程结构

* `entities`
> `sea-orm`生成的数据库实体代码库工程

* `keys`
> `jwt`用到的密钥文件

* `protocol`
> `flatbuffers` 协议文件, 由`proto`工程生成

* `route-marker`
>因为 rust 并不支持在 `proc_macro_attribute` 宏函数内访问和处理函数和 mod, 这里仅使用宏标记 route 并添加类型校验. 再由 `route-gen` 遍历被标注的路由函数生成路由绑定代码 

* `src`
> 工程代码主目录

* `scripts`
> 工具`shell`脚本目录
  * `gen-entities.sh` 生成数据库实体代码
  * `gen-config-mod.sh` 生成配置文件模块代码
  * `gen-routes.sh` 生成路由模块代码

## 数据库 & ORM

* 使用 `sea-orm` 作为 ORM 框架

* 使用`database`工程管理数据库表的创建和更新

* 使用`sea-orm-cli`生成数据库实体代码

  ```shell
  # sea-orm-cli generate entity --lib -o entities/src
  sh scripts/gen-entities.sh
  ```


## 配置文件
* 静态配置文件来自于工程`proto`, 大版本号为`proto`的`git branch name`, 小版本号为执行`deploy`的时间转换数字`yyyyMMddHHmmss`
* 配置工程`proto`在执行`deploy`的时候会上传生成的配置文件`bytes`到`cos`下对应版本所在路径, 并写入数据 pg 和 redis 最新配置版本号
* ~~game-server-rust 服务启动前从数据库/redis获取最新配置版本号, 与本地配置文件版本号对比, 如果不一致则从`cos`下载最新配置文件, 并subscribe配置版本号变更, 如果有变更则重新下载配置文件~~
* ~~需要当心 breaking change, 例如删除字段, 修改字段类型, 修改字段名, 修改字段顺序等, 可能会导致服务器崩溃. 所以需要在配置文件 env 中加入大版本号, cos 配置文件的路径当中也需要有大版本号, 只有大版本号相同的情况下才会下载配置文件~~
* game-server-rust 服务启动时从本地配置文件读取配置数据并缓存在内存中, 通过`redis`发布订阅机制触发更新配置数据
