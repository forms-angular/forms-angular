#!/bin/bash

grunt jshint

KARMA=./node_modules/karma/bin/karma
MOCHA=./node_modules/mocha/bin/mocha
PROTRACTOR=./node_modules/protractor/bin/protractor

$KARMA start config/karma.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$KARMA start config/karma.midway.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS

A=`lsof -Pnl +M -i4 | grep '3001'`

case ${A:0:4} in
	node )
		echo "Using already running server"
		B=0
		;;
	* )
		NODE_ENV=test node server/server.js > /dev/null &
		sleep 3 # give server time to start
		B=`lsof -Pnl +M -i4 | grep '3001' | grep -m 1 -o -E 'node\s+[0-9]+' | sed 's/node\s*//'`
		;;
esac

$MOCHA --recursive test/api/*.js
#$KARMA start config/karma-e2e.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$PROTRACTOR test/e2e/protractor-firefox.conf.js

case $B in
	0 )
		echo "Leaving server running"
		;;
	* )
		echo "Killing server"
		kill $B
esac
