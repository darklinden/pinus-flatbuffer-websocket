select 'drop table if exists "' || tablename || '" cascade;' from pg_tables where schemaname = 'public'; \gexec
