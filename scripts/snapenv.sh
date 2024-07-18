#! /usr/bin/bash
# An utility to easily backup .env file, and restore them when changing machine
zipfile=snapenv_"$(basename $(pwd) | sed --expression="s/\//_/g").zip"
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
    dest="."
else
    dest="$1"
fi
zippath="$dest$zipfile"
if [[ -f "$zippath" ]];then
    echo "Found a previous backup, remove:" 
    rm -i "$dest$zipfile"
fi
files=$(find . -maxdepth 3 -type f -name '.env*' | git check-ignore --stdin)
echo "Will create" $zipfile
echo "Containing files:" $files
zip "$zipfile" $files
mv "$zipfile" $dest
echo "Move zip to dest" $zippath