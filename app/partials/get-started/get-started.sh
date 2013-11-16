#!/bin/bash

wget https://raw.github.com/mchapman/forms-angular/master/app/partials/get-started/get-started-create.sh
bash get-started-create.sh
echo "Sub script complete...."
pwd
cd myapp
pwd

wget https://raw.github.com/mchapman/forms-angular/master/app/partials/get-started/adds-app.js
cat app.js adds-app.js > tempapp.js
mv tempapp.js app.js
sed -i s_^app.get_//app.get_ app.js
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/get-started/index.html -O public/index.html
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/get-started/myapp.js -O public/myapp.js
mkdir public/partials
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/get-started/partials-index.html -O public/partials/index.html
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/base-edit.html -O public/partials/base-edit.html
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/base-list.html -O public/partials/base-list.html
wget https://raw.github.com/mchapman/forms-angular/master/app/partials/base-analysis.html -O public/partials/base-analysis.html
node app.js
