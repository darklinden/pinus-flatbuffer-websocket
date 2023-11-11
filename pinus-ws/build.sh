#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"

echo "Project dir: ${PROJECT_DIR}"
echo "Building dependencies..."

FLATBUFFERS_DIR="${PROJECT_DIR}/dependencies/flatbuffers-js"
JWTNAPI_DIR="${PROJECT_DIR}/dependencies/jwt/napi-jwt"
PROTO_DIR="${PROJECT_DIR}/dependencies/proto"
ROUTE_DIR="${PROJECT_DIR}/dependencies/route"

echo "Building flatbuffers..."
cd "${FLATBUFFERS_DIR}" || exit
yarn install
yarn build
rm -rf ./node_modules

echo "Building jwt-napi-rs..."
cd "${JWTNAPI_DIR}" || exit
rm -rf ./*.node
yarn install
yarn build
rm -rf ./node_modules
rm -rf ./target

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

echo "Building project..."
cd "${PROJECT_DIR}" || exit
yarn install --production
yarn add ./dependencies/route

echo "Building..."
yarn tsc -p tsconfig.json

echo "Copying bytes..."
yarn ts-node ./tools/Copy --from "./dependencies/proto/generated/bytes" --to "./config/bytes" --extension bytes

echo "Copying config..."
yarn ts-node ./tools/Copy --from "./config" --to "./dist/config"

echo "Cleaning up dev dependencies..."
yarn install --production
