#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}/../")"

IMAGE_NAME="rust-http"

GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse --short HEAD)
IMAGE_TAG="${GIT_BRANCH}-${GIT_COMMIT}"

echo "Will build image: $IMAGE_NAME:$IMAGE_TAG"

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
docker build --progress=plain --no-cache -t $IMAGE_NAME:$IMAGE_TAG -f ./Dockerfile ./

# save image to tar
echo "Save image to tar..."
docker save $IMAGE_NAME:$IMAGE_TAG | gzip >$IMAGE_NAME.tar.gz

echo "Image $IMAGE_NAME:$IMAGE_TAG is Built!"
