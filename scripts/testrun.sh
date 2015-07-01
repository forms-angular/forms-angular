#!/bin/bash

KARMA=./node_modules/karma/bin/karma
MOCHA=./node_modules/mocha/bin/mocha

$KARMA start config/karma.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$KARMA start config/karma.midway.conf.js --no-auto-watch --single-run --reporters=dots --browsers=PhantomJS
$MOCHA test/api/*Spec.js
