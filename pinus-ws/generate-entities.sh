#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"
PARENT_DIR="$(dirname "${PROJECT_DIR}")"

echo "Check database status ..."
sh $PARENT_DIR/docker/scripts/live-db.sh

echo "Waiting for database ..."
while ! nc -z localhost 5432; do
    sleep 0.1
done
echo "Database is ready!"

ENTITIES_PATH="$PROJECT_DIR/app/domain/db/structs/entities"

rm -rf $ENTITIES_PATH
mkdir -p $ENTITIES_PATH
npx typeorm-model-generator -h localhost \
    -d postgres \
    -p 5432 \
    -u postgres \
    -x 123456 \
    -e postgres \
    -o $ENTITIES_PATH \
    --noConfig true \
    --cf param \
    --ce pascal \
    --cp snake
