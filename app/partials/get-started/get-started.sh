#!/bin/bash

bash get-started-create.sh
cat app.js public/partials/get-started/adds-app.js" > tempapp.js
mv tempapp.js app.js
sed -i s_app.get_//app.get_ app.js
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/get-started/index.html -o public/index.html
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/get-started/myapp.js -o public/myapp.js
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/get-started/partials-index.html -o public/partials/index.html
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/base-edit.html -o public/partials/base-edit.html
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/base-list.html -o public/partials/base-list.html
wget https://raw.github.com/mchapman/forms-angular/dev/app/partials/base-analysis -o public/partials/base-analysis.html
node app.js
