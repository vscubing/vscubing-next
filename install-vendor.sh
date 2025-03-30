#!/usr/bin/env bash
# This script installs tnoodle-cli@1.1.1 into the vendor directory.
# NOTE: only tested on WSL

NAME=tnoodle-cli-1.1.1-linux_x64.zip

mkdir -p vendor && cd vendor
curl -Lo $NAME https://github.com/SpeedcuberOSS/tnoodle-cli/releases/download/v1.1.1/tnoodle-cli-1.1.1-linux_x64.zip
unzip $NAME
rm $NAME
cd ../
