#!/bin/sh

mkdir myapp
cd myapp
express
npm install
npm install forms-angular --save
npm install mongoose --save
cd public
bower install forms-angular --allow-root
cd ..