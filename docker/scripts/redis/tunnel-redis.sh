#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
CURRENT_DIR="$(realpath "${BASEDIR}")"
SCRIPTS_DIR=$(dirname "$CURRENT_DIR")

$SET_FILE=$1

SERVER_HOST=""
SERVER_PORT=""
REDIS_AUTH=""

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh

echo "Starting ssh tunnel to $SERVER_HOST for redis-cli ..."
ssh -L 6380:localhost:6379 -N -f $SERVER_HOST -p $SERVER_PORT

echo "Running redis-cli ..."
cat $SET_FILE | REDISCLI_AUTH=$REDIS_AUTH redis-cli -h localhost -p 6380

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh
