'use strict';

var screenshots = require('./screenshots-shared');

browser.get('/#/bs3');     // Load the BS2 CSS
screenshots('bs3',320,2480);    // Quick way of getting rid of scroll bar, which squeezes width



