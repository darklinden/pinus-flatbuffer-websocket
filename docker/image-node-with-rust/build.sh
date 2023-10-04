#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"

IMAGE_NAME="node-with-rust:n16.20.2-r1.69.0"

# rm docker containers and images if exists
CONTAINERS=$(docker ps -a -q -f name=$IMAGE_NAME)
if [ -n "$CONTAINERS" ]; then
    docker rm -f $CONTAINERS
fi
IMAGES=$(docker images -q $IMAGE_NAME)
if [ -n "$IMAGES" ]; then
    docker rmi -f $IMAGES
fi

# build image
docker build --progress=plain --no-cache --tag $IMAGE_NAME -f ./Dockerfile ./

# upload image
docker image tag $IMAGE_NAME darklinden/$IMAGE_NAME
docker push darklinden/$IMAGE_NAME
