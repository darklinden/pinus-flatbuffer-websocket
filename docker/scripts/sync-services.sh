#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPTS_DIR="$(realpath "${BASEDIR}")"
PROJECT_DIR="$(realpath "${SCRIPTS_DIR}/..")"

SERVER_HOST=""
SERVER_PORT=""
SERVER_PROJECT_PATH=""
SERVER_IDENTITY_FILE=""

DB_USER=""
DB_PWD=""
REDIS_AUTH=""

# countdown timer
function countdown() {
    secs=$1
    shift
    msg=$@
    while [ $secs -gt 0 ]; do
        printf "\r\033[K 将在 %.d 秒后 $msg" $((secs--))
        sleep 1
    done
    echo
}

echo "即将操作:"
echo "\t - 关闭本地服务器"
echo "\t - 上传当前最新版本至本地测试服务器"
echo "\t - 启动本地测试服务器"
countdown 3 "开始"

echo "Network Sync ..."

echo "Source Directory $PROJECT_DIR"
echo "Destination Directory $SERVER_HOST:$SERVER_PROJECT_PATH"

ssh $SERVER_HOST -i $SERVER_IDENTITY_FILE -p $SERVER_PORT 'bash -s' <$SCRIPTS_DIR/ssh/stop-and-cleanup.sh

rsync -e "ssh -i $SERVER_IDENTITY_FILE -p $SERVER_PORT" -av $PROJECT_DIR/ $SERVER_HOST:$SERVER_PROJECT_PATH --exclude-from='exclude.txt'

ssh $SERVER_HOST -i $SERVER_IDENTITY_FILE -p $SERVER_PORT 'bash -s' <$SCRIPTS_DIR/ssh/start.sh
