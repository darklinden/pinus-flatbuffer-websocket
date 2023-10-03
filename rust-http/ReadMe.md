# actix-web-sea-orm

## entities

> <https://www.sea-ql.org/SeaORM/docs/next/generate-entity/sea-orm-cli/>

* Using sea-orm-cli

> Install sea-orm-cli with cargo.

```shell
cargo install sea-orm-cli
```

* Generating Entity Files

> If databse table is already created, you can generate entity files with sea-orm-cli.

```shell
sea-orm-cli generate entity --lib -o entities/src
```
