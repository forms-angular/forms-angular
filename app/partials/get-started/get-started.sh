#!/bin/bash

framework="bs2"
if [ $1 ]; then
	case $1 in
		bs3 )
			framework="bs3"
			;;
	esac
fi

if [ $2 ]; then
	branch="$2"
else
	branch="live"
fi

echo Setting up example app for branch $branch
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/get-started-create-auto.sh
bash get-started-create.sh $2
echo "Sub script complete...."
pwd
cd myapp
pwd

wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/adds-app.js
cat app.js adds-app.js > tempapp.js
mv tempapp.js app.js
sed -i s_^app.get_//app.get_ app.js
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/index.html -O public/index.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/myapp.js -O public/myapp.js
if [ $framework = "bs3" ]; then
    # upgrade to bootstrap 3
    cd public
    bower install bootstrap#3.1.1 --allow-root
    # upgrade to angular-ui-bootstrap 0.11
    bower install angular-ui-bootstrap-bower#0.11.0 --allow-root
    # upgrade to select2-bootstrap 1.3.0
    bower install select2-bootstrap-css#1.3.0 --allow-root
	# use the correct css
	sed -i.bak s_forms-angular-bs2.css_forms-angular-bs3.css_ index.html
	# set the bs3 option
	sed -i.bak "s_//uncomment to use Bootstrap 3--__" myapp.js
    cd ..
fi
if [ $2 ]; then
	sed -i.bak "s/var formsAngular = require('forms-angular');/var formsAngular = require('forms-angular-test');/" app.js
fi
mkdir public/partials
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/partials-index.html -O public/partials/index.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-edit.html -O public/partials/base-edit.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-list.html -O public/partials/base-list.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-analysis.html -O public/partials/base-analysis.html
node app.js
