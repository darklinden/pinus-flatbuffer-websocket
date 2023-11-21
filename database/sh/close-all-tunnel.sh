#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"

function kill_all_ssh_tunnel() {
    PIDS=$(ps aux | grep 'ssh -L' | grep -v grep | awk '{print $2}')
    if [ -n "$PIDS" ]; then

        echo ''
        echo "Killing ssh processes..."

        ps aux | grep 'ssh -L'

        for PID in $PIDS; do
            echo "Killing ssh process: $PID"
            kill -9 $PID
        done

        echo ''

        sleep 2
    fi
}

kill_all_ssh_tunnel

echo "Done."
