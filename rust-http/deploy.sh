#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"

IMAGE_NAME="rust-http"

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
