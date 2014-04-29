#!/bin/bash

BASE_DIR=`dirname $0`


KARMA=./node_modules/karma/bin/karma
MOCHA=./node_modules/mocha/bin/mocha

echo ""
echo "Running API tests"
echo "-----------------"

$MOCHA --recursive --watch $BASE_DIR/../server/lib --watch $BASE_DIR/../server/models $BASE_DIR/../test/api/*.js
