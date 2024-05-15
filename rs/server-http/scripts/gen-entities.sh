#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"
PROJECT_DIR="$(realpath "${SCRIPT_DIR}/..")"

ENTITIES_SRC="${PROJECT_DIR}/entities/src"

rm -rf "${ENTITIES_SRC}"
mkdir -p "${ENTITIES_SRC}"

cd "${PROJECT_DIR}"

sea-orm-cli generate entity --lib -o entities/src
