#!/bin/sh
set -e



echo "starting seed"
yarn db:prepare


echo "Starting application"
yarn start:prod

exec "$@"

