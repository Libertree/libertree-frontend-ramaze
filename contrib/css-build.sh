#!/bin/bash

if [[ -z $1 ]]; then
    echo "usage: css-build.sh theme-name"
    exit 1
fi

if [[ ! -d "themes/$1/scss" ]]; then
    echo "The source directory \`themes/$1/scss' does not exist."
    exit 1
fi

if [[ ! -d "themes/$1/css" ]]; then
    echo "The target directory \`themes/$1/css' does not exist."
    exit 1
fi

bundle exec "sass --update themes/$1/scss:themes/$1/css"
