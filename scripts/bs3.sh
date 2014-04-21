#!/bin/bash

rm -rf app/bower_components/bootstrap
mkdir app/bower_components/bootstrap
cp -r app/bower_components/bootstrap-3.1.1/* app/bower_components/bootstrap

rm -rf app/bower_components/select2-bootstrap-css
mkdir app/bower_components/select2-bootstrap-css
cp -r app/bower_components/select2-bootstrap-css-1.3.0/* app/bower_components/select2-bootstrap-css
