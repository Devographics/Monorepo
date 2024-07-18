#! /usr/bin/bash
# An utility to easily backup .env file, and restore them when changing machine
zipfile="$(basename $(pwd) | sed --expression="s/\//_/g").zip"
echo "Usage: snapenv.sh [<target folder>]"
echo "Will create zip locally as a default"
echo "Name of the zip = name of current folder"
echo "Target should usually be a shared folder eg using Dropbox"
echo "---"
echo "unsnapenv.sh <zip>"
echo "Will unzip respecting the folder locations"
echo "Should be run in the same folder as the snap command"
echo "---"
if [[ $# -lt 1 ]]; then
    echo "Please provide the path to your previous snapshot"
else
    source="$1"
fi
unzip "$source"