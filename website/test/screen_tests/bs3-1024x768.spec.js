'use strict';

var screenshots = require('./screenshots-shared');

browser.get('/#/bs3');     // Load the BS3 CSS
screenshots('bs3',1024,768);


