#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
CURRENT_DIR="$(realpath "${BASEDIR}")"
PROJECT_DIR=$(dirname "$CURRENT_DIR")

echo "Check database status ..."
sh $PROJECT_DIR/docker/scripts/live-db.sh

echo "Waiting for database ..."
while ! nc -z 10.10.10.11 5432; do
    sleep 0.1
done
echo "Database is ready!"

echo "Load environment variables ..."

if [ -f $PROJECT_DIR/host.env ]; then
    echo "Loading environment variables from $PROJECT_DIR/host.env ..."
    set -a
    source $PROJECT_DIR/host.env
    set +a
fi

if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set"
    exit
fi

echo "Migrating database $DATABASE_URL ..."

SQL_FILE=$CURRENT_DIR/create_or_update_table.sql

echo "Running: psql $DATABASE_URL -f $SQL_FILE"
psql $DATABASE_URL -f $SQL_FILE
