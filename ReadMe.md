# ReadMe

## proto -> protocol 协议

* 包括配置表 csv 和 网络通信协议 fbs
* 导出时处理了一些生成代码使其使用起来更简单(原本想要做通用处理，发现比较麻烦)
* 目前仅导出 ts 和 csharp
* 修改导出代码以少打几个字母...
* 生成 json 和 二进制数据，并校验数据
* ```npm run build``` 执行生成

## route 路由

* 遍历 server 内的装饰器生成路由表，原本是用于自动化组包拆包使用，切换 flatbuffers 之后仅作为标注
* ```npm run build``` 拷贝proto的文件，并启动生成

## server 使用 pinuis 写的简单服务

* 包含读取 flatbuffers 的 bytes 配置数据
* 包含网络发送和接收 flatbuffers 数据
* ```npm run build-deps``` 执行route生成，并添加引用
* ```npm run build``` 执行编译
* ```npm run test``` 编译并启动服务

## unity 使用 unity 写的客户端 demo

* Tools/0gen.py 拷贝 proto 的代码, route的路由表
* Configs 读取并存储配置信息
  * 配置文件多层存储
  * Configs Instances 缓存数据文件二进制和 id -> index Dictionary 以方便从id快速查找数据
