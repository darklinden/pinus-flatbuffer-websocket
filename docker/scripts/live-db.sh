#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPTS_DIR="$(realpath "${BASEDIR}")"
PROJECT_DIR="$(realpath "${SCRIPTS_DIR}/..")"

echo "docker-compose directory $PROJECT_DIR"
cd $PROJECT_DIR

# stop all containers
docker compose down --remove-orphans

sleep 1

# start db and redis
docker compose up -d postgresql redis
