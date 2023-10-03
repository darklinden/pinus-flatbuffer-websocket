DO $$

DECLARE

table_user_existence BIGINT;

BEGIN

-- data migration for user
DROP TABLE
  IF EXISTS "user_migration_tmp";

SELECT
  count(*)
FROM
  information_schema.tables
WHERE
  table_name = 'user' 
INTO table_user_existence;

IF table_user_existence THEN

    RAISE NOTICE 'table user exists, save data to tmp table';

    -- save data to tmp table
    CREATE TEMP TABLE "user_migration_tmp" AS
    SELECT
    *
    FROM
    "user";

END IF;

DROP TABLE
  IF EXISTS "user";

CREATE TABLE
  "user" (
    "id" BIGSERIAL NOT NULL,
    "account" character varying,
    "password" character varying,
    "token_iat_limit" bigint NOT NULL DEFAULT '0',
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
  );

CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "user" ("account");

IF table_user_existence > 0 THEN

    RAISE NOTICE 'table user exists, insert data from tmp table';

    -- insert data from tmp table
    INSERT INTO "user"
    SELECT
    *
    FROM
    "user_migration_tmp";

    DROP TABLE
    IF EXISTS "user_migration_tmp";

    -- reset sequence hack return
    SELECT SETVAL (
        'user_id_seq',
        (
        SELECT
            MAX(id)
        FROM
            "user"
        )
    ) INTO table_user_existence;

END IF;

END;

$$ LANGUAGE plpgsql ;