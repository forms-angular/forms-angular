#!/bin/bash
#./scripts/web-server.js > /dev/null &
#sleep 1 # give server time to start
testacular start config/testacular.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
testacular start config/testacular-e2e.conf.js --reporters=dots --browsers=PhantomJS
