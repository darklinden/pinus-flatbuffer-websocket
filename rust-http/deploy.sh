#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
PROJECT_DIR="$(realpath "${BASEDIR}")"

IMAGE_NAME="rust-http"

# rm docker containers and images if exists
docker rm -f $(docker ps -a -q -f name=$IMAGE_NAME)
docker rmi -f $(docker images -q $IMAGE_NAME)
rm -f ./$IMAGE_NAME.tar.gz

# build image
docker build --progress=plain --no-cache -t $IMAGE_NAME -f ./Dockerfile ./

# save image to tar
docker save $IMAGE_NAME | gzip >$IMAGE_NAME.tar.gz

# copy image to docker
rm -rf ../docker/$IMAGE_NAME/$IMAGE_NAME.tar.gz
mkdir -p ../docker/$IMAGE_NAME
mv ./$IMAGE_NAME.tar.gz ../docker/$IMAGE_NAME/$IMAGE_NAME.tar.gz
