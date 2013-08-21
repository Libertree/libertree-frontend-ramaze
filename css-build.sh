#!/bin/bash

if [[ -z $1 ]]; then
    echo "usage: css-build.sh theme-name"
    exit 1
fi

if [[ ! -d "$1/scss" ]]; then
    echo "The source directory \`$1/scss' does not exist."
    exit 1
fi

if [[ ! -d "$1/css" ]]; then
    echo "The target directory \`$1/css' does not exist."
    exit 1
fi

bundle exec "sass --update $1/scss:$1/css"
