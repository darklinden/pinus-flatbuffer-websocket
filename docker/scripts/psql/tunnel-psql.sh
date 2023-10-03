#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
CURRENT_DIR="$(realpath "${BASEDIR}")"
SCRIPTS_DIR=$(dirname "$CURRENT_DIR")

$SET_FILE=$1

SERVER_HOST=""
SERVER_PORT=""
DB_USER=""
DB_PWD=""

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh

echo "Starting ssh tunnel to $SERVER_HOST for psql ..."
ssh -L 5433:localhost:5432 -N -f $SERVER_HOST -p $SERVER_PORT

echo "Running sql file $SET_FILE ..."
PGPASSWORD=$DB_PWD psql --username=$DB_USER --port=5433 --host=localhost --set=sslmode=prefer -f $SET_FILE

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh
