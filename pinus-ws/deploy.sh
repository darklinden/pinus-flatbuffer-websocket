#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"
PARENT_DIR="$(dirname "${PROJECT_DIR}")"

# copy dependencies
rm -rf $PROJECT_DIR/dependencies
mkdir -p $PROJECT_DIR/dependencies

rm -rf $PARENT_DIR/proto/node_modules
cp -r $PARENT_DIR/proto $PROJECT_DIR/dependencies/proto

rm -rf $PARENT_DIR/route/node_modules
cp -r $PARENT_DIR/route $PROJECT_DIR/dependencies/route

rm -rf $PARENT_DIR/jwt/napi-jwt/node_modules
rm -rf $PARENT_DIR/jwt/napi-jwt/target
cp -r $PARENT_DIR/jwt $PROJECT_DIR/dependencies/jwt

rm -rf $PARENT_DIR/flatbuffers-js/node_modules
cp -r $PARENT_DIR/flatbuffers-js $PROJECT_DIR/dependencies/flatbuffers-js

IMAGE_NAME="pinus-ws"

# rm docker containers and images if exists
CONTAINERS=$(docker ps -a -q -f name=$IMAGE_NAME)
if [ -n "$CONTAINERS" ]; then
    docker rm -f $CONTAINERS
fi
IMAGES=$(docker images -q $IMAGE_NAME)
if [ -n "$IMAGES" ]; then
    docker rmi -f $IMAGES
fi
rm -f ./$IMAGE_NAME.tar.gz

# build image
docker build --progress=plain --no-cache -t $IMAGE_NAME -f ./Dockerfile ./

# save image to tar
docker save $IMAGE_NAME | gzip >$IMAGE_NAME.tar.gz

# copy image to docker
rm -rf ../docker/$IMAGE_NAME/$IMAGE_NAME.tar.gz
mkdir -p ../docker/$IMAGE_NAME
mv ./$IMAGE_NAME.tar.gz ../docker/$IMAGE_NAME/$IMAGE_NAME.tar.gz
