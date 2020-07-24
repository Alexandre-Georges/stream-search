#!/bin/sh

if [ "$1" == "--help" ]; then
  echo "Usage: sh run.sh [--timeout=2000] [--workers=10]"
else
  node index.js $1 $2
fi