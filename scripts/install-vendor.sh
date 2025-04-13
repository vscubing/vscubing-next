#!/usr/bin/env bash
# NOTE: This script installs tnoodle-cli@1.1.1 into the vendor directory.
# only tested on MacOS
# requitements: curl, unzip

# Detect OS
if [[ "$(uname -s)" == "Darwin" ]]; then
    PLATFORM="mac_x64"
elif [[ "$(uname -s)" == "Linux" ]]; then
    PLATFORM="linux_x64"
else
    echo "This script only supports MacOS and Linux. If you use Windows, consider switching to WSL. Exiting..."
    exit 1
fi

PACKAGE_NAME=tnoodle-cli-1.1.1

if [ -d "vendor/$PACKAGE_NAME" ]; then
    echo "tnoodle-cli already installed. Exiting..."
    exit 0
fi

mkdir -p vendor && cd vendor
curl -Lo $NAME.zip https://github.com/SpeedcuberOSS/tnoodle-cli/releases/download/v1.1.1/tnoodle-cli-1.1.1-$PLATFORM.zip
unzip $NAME.zip && rm $NAME.zip
mv tnoodle-cli-$PLATFORM $PACKAGE_NAME
cd ../
