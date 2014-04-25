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
	branch="0.2"
fi

echo Setting up example app for branch $branch
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/get-started-create.sh
bash get-started-create.sh
echo "Sub script complete...."
pwd
cd myapp
pwd

# We use this next option when we want to use the bower.json from git rather than the
# live forms-angular bower download
if [ $3 = "bower" ]; then
	echo Updating Packages
	cd public
	wget https://raw.github.com/mchapman/forms-angular/$branch/bower.json
	bower install --allow-root
	bower update --allow-root
	cd ..
fi

wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/adds-app.js
cat app.js adds-app.js > tempapp.js
mv tempapp.js app.js
sed -i s_^app.get_//app.get_ app.js
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/index.html -O public/index.html
if [ $framework = "bs3" ]; then
	#  use the correct css
	sed -i s_forms-angular-bs2.css_forms-angular-bs3.css_ public/index.html
	#  set the bs3 option
	sed -i s_//uncomment to use Bootstrap 3--__ public/myapp.js
fi


wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/myapp.js -O public/myapp.js
mkdir public/partials
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/get-started/partials-index.html -O public/partials/index.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-edit.html -O public/partials/base-edit.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-list.html -O public/partials/base-list.html
wget https://raw.github.com/mchapman/forms-angular/$branch/app/partials/base-analysis.html -O public/partials/base-analysis.html
node app.js
