CREATE TABLE "login_history" (
    "id" bigserial NOT NULL,
    "uid" bigserial NOT NULL,
    "login_type" integer NOT NULL,
    "login_time" bigint NOT NULL,
    "ip" character varying,
    CONSTRAINT "PK_fe377f36d49c39547cb6b9f0727" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_3b0b0d3f8b0e2e9f9b4b4b968b" ON "login_history" ("uid");

CREATE INDEX "IDX_7c03e495294640bd6aaa50adcd" ON "login_history" ("ip");

