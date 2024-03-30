#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
DATABASE_DIR="$(realpath "${BASEDIR}")"

echo "Load environment variables ..."

if [ -f $DATABASE_DIR/.env ]; then
    echo "Loading environment variables from $DATABASE_DIR/.env ..."
    set -a
    source $DATABASE_DIR/.env
    set +a
fi

echo "Starting ssh tunnel to $REMOTE_HOST postgresql for local port 5433..."
ssh -L 5433:localhost:5432 -N -f $REMOTE_HOST

echo "Starting ssh tunnel to $REMOTE_HOST redis for local port 6380..."
ssh -L 6380:localhost:6379 -N -f $REMOTE_HOST
