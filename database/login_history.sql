DO $$

DECLARE

table_login_history_existence BIGINT;

BEGIN

-- data migration for login_history
DROP TABLE
  IF EXISTS "login_history_migration_tmp";

SELECT
  count(*)
FROM
  information_schema.tables
WHERE
  table_name = 'login_history'
INTO table_login_history_existence;

IF table_login_history_existence THEN

    RAISE NOTICE 'table login_history exists, save data to tmp table';

    -- save data to tmp table
    CREATE TEMP TABLE "login_history_migration_tmp" AS
    SELECT *
    FROM "login_history";
END IF;


DROP TABLE
  IF EXISTS "login_history";


CREATE TABLE
  "login_history" (
    "id" BIGSERIAL NOT NULL,
    "uid" BIGSERIAL NOT NULL,
    "login_type" integer NOT NULL,
    "login_time" bigint NOT NULL,
    "ip" character varying,
    CONSTRAINT "PK_fe377f36d49c39547cb6b9f0727" PRIMARY KEY ("id")
  );


CREATE INDEX "IDX_3b0b0d3f8b0e2e9f9b4b4b968b" ON "login_history" ("uid");


CREATE INDEX "IDX_7c03e495294640bd6aaa50adcd" ON "login_history" ("ip");


IF table_login_history_existence THEN

    RAISE NOTICE 'table login_history exists, insert data from tmp table';

    -- insert data from tmp table
    INSERT INTO
    "login_history"
    SELECT
    *
    FROM
    "login_history_migration_tmp";


    DROP TABLE
    IF EXISTS "login_history_migration_tmp";

    -- reset sequence hack return
    SELECT SETVAL (
        'login_history_id_seq',
        (
        SELECT
            MAX(id)
        FROM
            "login_history"
        )
    ) INTO table_login_history_existence;

END IF;

END;
$$