#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"
PARENT_DIR="$(dirname "${PROJECT_DIR}")"

PROTO_DIR="${PARENT_DIR}/proto"
ROUTE_DIR="${PARENT_DIR}/route"

echo "Building proto..."
cd "${PROTO_DIR}" || exit
yarn install
yarn run build

echo "Building route..."
cd "${ROUTE_DIR}" || exit
yarn install
yarn run build

echo "Building project..."
cd "${PROJECT_DIR}" || exit
yarn install
yarn add ../route

echo "Building..."
yarn tsc -p tsconfig.json

echo "Copying bytes..."
yarn ts-node ./tools/Copy --from "$PROTO_DIR/generated/bytes" --to "$PROJECT_DIR/config/bytes" --extension bytes

echo "Copying config..."
yarn ts-node ./tools/Copy --from "./config" --to "./dist/config"

node ./dist/app
