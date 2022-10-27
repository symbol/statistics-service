#!/bin/bash

set -ex

# generate version.txt to be used in publishing
node --version
npm --version
echo $(npm run version --silent) > version.txt
