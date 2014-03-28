#!/bin/bash

KARMA_EXE=/usr/bin/karma

if [ ! -x $KARMA_EXE ]; then
	KARMA_EXE=../node_modules/.bin/karma
fi
$KARMA_EXE start config/karma.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$KARMA_EXE start config/karma.midway.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS

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

mocha --recursive test/api/*.js
${KARMA_EXE} start config/karma-e2e.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS

case $B in
	0 )
		echo "Leaving server running"
		;;
	* )
		echo "Killing server"
		kill $B
esac