#!/bin/bash

grunt jshint

KARMA=./node_modules/karma/bin/karma

$KARMA start config/karma.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$KARMA start config/karma.midway.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
