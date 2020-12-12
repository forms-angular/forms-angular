'use strict';

const fs = require('fs');

const args = process.argv.slice(2);
if (args[0] === 'production') {
    // set up for build process
    fs.renameSync('app/index.html', 'app/index-dev.html');
    var contents = fs.readFileSync('app/index-dev.html').toString().split('\n');
    var shared = 0, inDev = 1, inProd = 2;
    var state = shared;
    var newContents = [];
    for (var i = 0; i < contents.length; i++) {
        switch (contents[i].trim()) {
            case '<!-- production -->':
                state = inProd;
                break;
            case '<!-- dev -->':
                state = inDev;
                break;
            case '<!-- endproduction -->':
            case '<!-- enddev -->':
                state = shared;
                break;
            default:
                if (state === shared) {
                    newContents.push(contents[i]);
                } else if (state === inProd) {
                    newContents.push(contents[i].replace('<!--', '').replace('-->',''));
                }
        }
    }
    fs.writeFileSync('app/index.html', newContents.join('\n'));
} else if (args[0] === 'development') {
    // reset to the one we use for dev
    fs.renameSync('app/index-dev.html', 'app/index.html');
}

process.exit(0);