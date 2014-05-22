#!/bin/sh

# Any changes to this that are unconditional need to be
# reflected in get-started-create.sh
# The two are maintained so that the web site doesn't expose
# all the conditionals and --allow-root below (which are
# used for testing the getting started)

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