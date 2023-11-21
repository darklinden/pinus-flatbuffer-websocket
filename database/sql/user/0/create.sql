CREATE TABLE "user" (
    "id" bigserial NOT NULL,
    "account" character varying,
    "password" character varying,
    "token_iat_limit" bigint NOT NULL DEFAULT '0',
    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "user" ("account");

