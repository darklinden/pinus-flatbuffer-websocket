CREATE TABLE "login_history" (
    "id" bigserial NOT NULL,
    "user_id" bigint NOT NULL,
    "login_type" integer NOT NULL,
    "login_time" bigint NOT NULL,
    "ip" character varying,
    CONSTRAINT "PK_login_history" PRIMARY KEY ("id")
);

