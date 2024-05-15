CREATE TABLE "system_mail" (
    "id" bigserial NOT NULL,
    "is_active" integer NOT NULL DEFAULT '1',
    "title" character varying NOT NULL,
    "content" character varying NOT NULL,
    "active_time" bigint NOT NULL,
    "expire_time" bigint NOT NULL,
    "reward_types" integer ARRAY NOT NULL DEFAULT '{}',
    "reward_values" bigint ARRAY NOT NULL DEFAULT '{}',
    CONSTRAINT "PK_system_mail" PRIMARY KEY ("id")
);

COMMENT ON COLUMN "system_mail"."id" IS '自增id';

COMMENT ON COLUMN "system_mail"."is_active" IS '配置是否启用 0:不启用 1:启用';

COMMENT ON COLUMN "system_mail"."title" IS '邮件标题';

COMMENT ON COLUMN "system_mail"."content" IS '邮件内容';

COMMENT ON COLUMN "system_mail"."active_time" IS '启动时间-当前时间未达到启动时间则不发送-(-1)表示不受影响永远有效';

COMMENT ON COLUMN "system_mail"."expire_time" IS '过期时间-当前时间超过过期时间则不再发送-(-1)表示不受影响永远有效';

COMMENT ON COLUMN "system_mail"."reward_types" IS '邮件奖励类型列表';

COMMENT ON COLUMN "system_mail"."reward_values" IS '邮件奖励值列表';

