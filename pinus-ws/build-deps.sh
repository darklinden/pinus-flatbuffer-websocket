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
rm -rf ./node_modules

echo "Building route..."
cd "${ROUTE_DIR}" || exit
yarn install
yarn run build
rm -rf ./node_modules

echo "Building deps..."
cd "${PROJECT_DIR}" || exit
yarn install
yarn add ../route

echo "Copying bytes..."
node ./tools/copy --from="../proto/generated/bytes" --to="./config/bytes" --extension=bytes
