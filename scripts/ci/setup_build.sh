#!/bin/bash

set -ex

bash client/generate.sh

# generate version.txt to be used in publishing
echo $(npm run version --silent) > version.txt
