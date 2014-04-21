#!/bin/bash

function clear () {
	rm -rf app/bower_components/bootstrap
	mkdir app/bower_components/bootstrap
	rm -rf app/bower_components/select2-bootstrap-css
	mkdir app/bower_components/select2-bootstrap-css
}

if [ $1 ]; then
	case "$1" in
		"bs2" )
			cp -r app/bower_components/bootstrap-2.3.2/* app/bower_components/bootstrap
			cp -r app/bower_components/select2-bootstrap-css-1.2.0/* app/bower_components/select2-bootstrap-css
			cp app/css/bootswatch-cerulean-2.3.2.less app/css/bootswatch.less
			cp app/css/variables-cerulean-2.3.2.less app/css/variables.less
			cat app/css/warning-banner.less app/css/forms-angular-bs2.less > app/css/forms-angular.less
			;;
		"bs3" )
			cp -r app/bower_components/bootstrap-3.1.1/* app/bower_components/bootstrap
			cp -r app/bower_components/select2-bootstrap-css-1.3.0/* app/bower_components/select2-bootstrap-css
			cp app/css/bootswatch-cerulean-3.1.1.less app/css/bootswatch.less
			cp app/css/variables-cerulean-3.1.1.less app/css/variables.less
			cat app/css/warning-banner.less app/css/forms-angular-bs3.less > app/css/forms-angular.less
			;;
		* )
			echo "Invalid option $1"
			;;
	esac
else
	echo ""
	echo Usage: framework [bs2, bs3]
	echo ""
fi
