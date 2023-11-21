CREATE TABLE "user_info" (
    "id" bigserial NOT NULL,
    "name" character varying NOT NULL,
    "level" integer NOT NULL,
    "last_login_version" character varying NOT NULL DEFAULT '',
    CONSTRAINT "PK_495a51b288528ad9e4a0125060c" PRIMARY KEY ("id")
);

COMMENT ON COLUMN "user_info"."id" IS 'id';

COMMENT ON COLUMN "user_info"."name" IS '昵称';

COMMENT ON COLUMN "user_info"."level" IS '等级';

COMMENT ON COLUMN "user_info"."last_login_version" IS '玩家上次登陆时的配置文件版本，用于检测数据刷新';

