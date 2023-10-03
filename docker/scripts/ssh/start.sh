#!/bin/bash

cd /Users/Shared/projects

ulimit -n 65535

/usr/local/bin/docker compose up -d
