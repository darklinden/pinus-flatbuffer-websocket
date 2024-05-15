#!/usr/bin/env bash

# https://github.com/fornwall/rust-script
# cargo install rust-script

SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR=$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)
    SOURCE=$(readlink "$SOURCE")
    [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
SCRIPT_DIR=$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)

# echo "SCRIPT_DIR: ${SCRIPT_DIR}"

cd "${SCRIPT_DIR}" || exit 1

rust-script --cargo-output --debug route-gen.rs
