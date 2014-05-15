#!/bin/sh

mkdir myapp
cd myapp
express
npm install

if [ $1 ]; then
  npm install forms-angular-test --save
else
  npm install forms-angular --save
fi
npm install mongoose --save
cd public
if [ $1 ]; then
  bower install forms-angular#dev --allow-root
else
  bower install forms-angular --allow-root
fi
cd ..