#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPTS_DIR="$(realpath "${BASEDIR}")"

REMOTE_SERVER=""
REMOTE_PORT=""
LOCAL_SERVER=""
LOCAL_PORT=""

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
echo "\t - 从 $REMOTE_SERVER 导出数据库 dump"
echo "\t - 关闭本地服务器"
echo "\t - 使用 dump 数据库覆盖本地数据库"
countdown 3 "开始"

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh

echo "Starting dump remote..."

TIME=$(date '+%Y%m%d_%H%M%S')
mkdir -p $SCRIPT_DIR/tmp
TMP_DUMP_FILE=$SCRIPT_DIR/tmp/dump_$TIME.dump

echo "Starting ssh tunnel to remote..."
ssh -L 5433:localhost:5432 -N -f $REMOTE_SERVER -p $REMOTE_PORT

echo "Dumping database..."
PGPASSWORD=$REMOTE_DB_PWD pg_dump --username=$DB_USER --port=5433 --host=localhost -Fc $DB_USER >$TMP_DUMP_FILE

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh

echo "Network Sync ..."

echo "Starting ssh tunnel to local for psql ..."
ssh -L 5433:localhost:5432 -N -f $LOCAL_SERVER -p $LOCAL_PORT

echo "Dropping local database..."
PGPASSWORD=$DB_PWD psql --username=$DB_USER --port=5433 --host=localhost --set=sslmode=prefer -f $SCRIPT_DIR/psql/drop-psql.sql

echo "Restore local database..."
PGPASSWORD=$DB_PWD pg_restore --username=$DB_USER --port=5433 --host=localhost -d $DB_USER $TMP_DUMP_FILE

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh

echo "Starting ssh tunnel to local for redis-cli ..."
ssh -L 6380:localhost:6379 -N -f $LOCAL_SERVER -p $LOCAL_PORT

echo "Flushing redis..."
REDISCLI_AUTH=$DB_PWD redis-cli -h localhost -p 6380 FLUSHALL

sh $SCRIPTS_DIR/ssh/close-all-tunnel.sh
