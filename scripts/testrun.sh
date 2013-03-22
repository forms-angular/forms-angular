#!/bin/bash

#node server/server.js > /dev/null &
#sleep 1 # give server time to start
karma start config/karma.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
#karma start config/karma-e2e.conf.js --reporters=dots --browsers=PhantomJS
