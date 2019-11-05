#!/bin/bash

rm -rf ./dist
mkdir -p dist

npm run prod

zip -r dist{.zip,}
