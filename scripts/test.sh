#!/bin/bash

BASE_DIR=`dirname $0`


KARMA=./node_modules/karma/bin/karma
MOCHA=./node_modules/mocha/bin/mocha

echo ""
echo "Starting Karma Server"
echo "---------------------"

$KARMA start $BASE_DIR/../config/karma.conf.js $*
