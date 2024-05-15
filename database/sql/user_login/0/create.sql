CREATE TABLE "user_login" (
    "id" bigserial NOT NULL,
    "account" character varying,
    "password" character varying,
    "role" integer NOT NULL DEFAULT '0',
    CONSTRAINT "PK_user_login" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_user_login_account" ON "user_login" ("account");

