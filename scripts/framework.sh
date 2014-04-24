#!/bin/bash

function Clear {
    echo Clearing out bower component directories
	rm -rf app/bower_components/bootstrap
	mkdir app/bower_components/bootstrap
	rm -rf app/bower_components/select2-bootstrap-css
	mkdir app/bower_components/select2-bootstrap-css
	rm -rf app/bower_components/angular-ui-bootstrap
	mkdir app/bower_components/angular-ui-bootstrap
}

function InstallBootstrap {
	if [ -d "app/bower_components/bootstrap-$1" ]; then
		echo Using existing copy of Bootstrap $1
		cp -r app/bower_components/bootstrap-$1/* app/bower_components/bootstrap
	else
		echo Downloading and installing Bootstrap $1
		bower install bootstrap\#$1
		mkdir app/bower_components/bootstrap-$1
		cp -r app/bower_components/bootstrap/* app/bower_components/bootstrap-$1
	fi
}

# $1 = bower name  $2 = version
# We will build from directory angular-ui-bootstrap, which no version is named (I think)
function InstallUIBootstrap {
	if [ -d "app/bower_components/$1-$2" ]; then
		echo Using existing copy of Bootstrap UI $2
		cp -r app/bower_components/$1-$2/* app/bower_components/angular-ui-bootstrap
	else
		echo Downloading and installing Bootstrap UI $2
		bower install $1\#$2
		mkdir app/bower_components/$1-$2
		cp -r app/bower_components/$1/* app/bower_components/$1-$2
	fi
}

function InstallSelect2CSS {
	if [ -d "app/bower_components/select2-bootstrap-css-$1" ]; then
		echo Using existing copy of select2-bootstrap-css $1
		cp -r app/bower_components/select2-bootstrap-css-$1/* app/bower_components/select2-bootstrap-css
	else
		echo Downloading and installing select2-bootstrap-css $1
		bower install select2-bootstrap-css\#$1
		mkdir app/bower_components/select2-bootstrap-css-$1
		cp -r app/bower_components/select2-bootstrap-css/* app/bower_components/select2-bootstrap-css-$1
	fi
}

Clear
if [ $1 ]; then
	case "$1" in
		"bs2" )
			InstallBootstrap "2.3.2"
			InstallUIBootstrap "angular-ui-bootstrap-bower" "0.8.0"
			InstallSelect2CSS "1.2.0"
			;;
		"bs3" )
			InstallBootstrap "3.1.1"
			InstallUIBootstrap "angular-bootstrap" "0.10.0"
			InstallSelect2CSS "1.3.0"
			;;
		* )
			echo "Invalid option $1"
			;;
	esac
	echo Generating css
	grunt less:$1
else
	echo ""
	echo Usage: framework [bs2, bs3]
	echo ""
fi
