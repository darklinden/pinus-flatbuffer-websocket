#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"

cd "${PROJECT_DIR}" || exit 1

ALL_SQLS=$(find . -name "*.sql")

for sql in ${ALL_SQLS}; do
    echo "Formatting ${sql}"
    pg_format --config $PROJECT_DIR/.pg_format "${sql}" >"${sql}.tmp"
    mv "${sql}.tmp" "${sql}"
done

echo "Done"
