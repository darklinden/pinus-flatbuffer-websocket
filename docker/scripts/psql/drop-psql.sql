SELECT
    'drop table if exists "' || tablename || '" cascade;'
FROM
    pg_tables
WHERE
    schemaname = 'public';

\gexec

