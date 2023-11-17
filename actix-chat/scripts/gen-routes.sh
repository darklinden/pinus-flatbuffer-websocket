#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
SCRIPT_DIR="$(realpath "${BASEDIR}")"
PROJECT_DIR="$(realpath "${SCRIPT_DIR}/..")"

ROUTE_GENERATOR="${PROJECT_DIR}/route-generator"

cd "${ROUTE_GENERATOR}" || exit 1

cargo r
