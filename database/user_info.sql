DO $$
DECLARE

table_user_info_existence BIGINT;

BEGIN

-- data migration for user_info

DROP TABLE
  IF EXISTS "user_info_migration_tmp";

SELECT
  count(*)
FROM
  information_schema.tables
WHERE
  table_name = 'user_info'
INTO table_user_info_existence;

IF table_user_info_existence THEN

    RAISE NOTICE 'table user_info exists, save data to tmp table';

    -- save data to tmp table
    CREATE TEMP TABLE "user_info_migration_tmp" AS
    SELECT
    *
    FROM
    "user_info";

END IF;

DROP TABLE
  IF EXISTS "user_info";

CREATE TABLE
  "user_info" (
    "id" BIGSERIAL NOT NULL,
    "name" character varying NOT NULL,
    "level" integer NOT NULL,
    "last_login_version" character varying NOT NULL DEFAULT '',
    CONSTRAINT "PK_495a51b288528ad9e4a0125060c" PRIMARY KEY ("id")
  );

COMMENT ON COLUMN "user_info"."id" IS 'id';
COMMENT ON COLUMN "user_info"."name" IS '昵称';
COMMENT ON COLUMN "user_info"."level" IS '等级';
COMMENT ON COLUMN "user_info"."last_login_version" IS '玩家上次登陆时的配置文件版本，用于检测数据刷新';

IF table_user_info_existence THEN

    RAISE NOTICE 'table user_info exists, insert data from tmp table';

    -- insert data from tmp table
    INSERT INTO "user_info"
    SELECT
    *
    FROM
    "user_info_migration_tmp";

    DROP TABLE
    IF EXISTS "user_info_migration_tmp";

END IF;

END;

$$ LANGUAGE plpgsql ;

