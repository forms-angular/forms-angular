#!/bin/bash

function Clear () {
    echo Clearing out bower component directories
	rm -rf app/bower_components/bootstrap
	mkdir app/bower_components/bootstrap
	rm -rf app/bower_components/select2-bootstrap-css
	mkdir app/bower_components/select2-bootstrap-css
	rm -rf app/bower_components/angular-ui-bootstrap
	mkdir app/bower_components/angular-ui-bootstrap
}

Clear
if [ $1 ]; then
	case "$1" in
		"bs2" )
		    echo Copying in bs2 variants
			cp -r app/bower_components/bootstrap-2.3.2/* app/bower_components/bootstrap
			cp -r app/bower_components/select2-bootstrap-css-1.2.0/* app/bower_components/select2-bootstrap-css
			cp -r app/bower_components/angular-ui-bootstrap-bower/* app/bower_components/angular-ui-bootstrap
			cp app/css/bootswatch-cerulean-2.3.2.less app/css/bootswatch.less
			cp app/css/variables-cerulean-2.3.2.less app/css/variables.less
			cp app/demo/css/demo-bs2.less app/demo/css/demo.less
			cat app/css/warning-banner.less app/css/forms-angular-bs2.less > app/css/forms-angular.less
			;;
		"bs3" )
		    echo Copying in bs3 variants
			cp -r app/bower_components/bootstrap-3.1.1/* app/bower_components/bootstrap
			cp -r app/bower_components/select2-bootstrap-css-1.3.0/* app/bower_components/select2-bootstrap-css
			cp -r app/bower_components/angular-ui-bootstrap-0.10.0/* app/bower_components/angular-ui-bootstrap
			cp app/css/bootswatch-cerulean-3.1.1.less app/css/bootswatch.less
			cp app/css/variables-cerulean-3.1.1.less app/css/variables.less
			cp app/demo/css/demo-bs3.less app/demo/css/demo.less
			cat app/css/warning-banner.less app/css/forms-angular-bs3.less > app/css/forms-angular.less
			;;
		* )
			echo "Invalid option $1"
			;;
	esac
	echo Generating css
	grunt less
else
	echo ""
	echo Usage: framework [bs2, bs3]
	echo ""
fi
