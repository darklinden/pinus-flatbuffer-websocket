#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"

HOST=
PORT=

# countdown timer
function countdown() {
    secs=$1
    shift
    while [ $secs -gt 0 ]; do
        printf "\r\033[K Please wait %.d s to continue, or press Ctrl+C to cancel." $((secs--))
        sleep 1
    done
    echo
}

echo "Is about to:"
echo "\t - Connect to remote server $HOST:$PORT"
echo "\t - Close all services"
echo "\t - Start remote database"
countdown 3

# Yes to continue
read -p "Please Confirm (Yes/[default: No]): " Confirm
Confirm=${Confirm:-No}

if [ $Confirm != "Yes" ]; then
    echo "User cancelled."
    exit 0
fi

echo "Make sure remote database is running ..."
ssh $HOST -p $PORT 'bash -s' <$SCRIPT_DIR/remote-db-only.sh

echo "Starting ssh tunnel to $HOST postgresql for local port 5433 ..."
ssh -L 5433:localhost:5432 -N -f $HOST -p $PORT

echo "Starting ssh tunnel to $HOST redis for local port 6380 ..."
ssh -L 6380:localhost:6379 -N -f $HOST -p $PORT
