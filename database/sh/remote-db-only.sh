#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"

cd $PROJECT_PATH

echo "stop all containers ..."
docker compose down --remove-orphans

echo "start remote database ..."
docker compose up -d postgresql redis
