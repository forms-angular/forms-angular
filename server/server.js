/**
 * Module dependencies.
 */
var express = require('express')
    , fs = require('fs')
    , mongoose = require('mongoose')
    , exec = require('child_process').exec
    , https = require('https')
    , path = require('path')
    , chalk = require('chalk')
    , glob = require('glob')
    , Q = require('q')
;

// environment configurations
// note that paths are relative to this file's __dirname
var cfg = {
    development: {
        name: 'Development',
        port: process.env.PORT || 3001,
        db: 'mongodb://192.168.1.7/forms-ng_dev',
        statics: [
            '../app'
        ],
        uploadDir: '../app/tmp',
        errorConfig: {
            dumpExceptions: true,
            showStack: true
        },
        dhfConfig: {
            urlPrefix : '/api/'
        }
    },
    test: {
        name: 'Test',
        db: 'mongodb://192.168.1.7/forms-ng_test',
        port: process.env.PORT || 3002,
        statics: [
            '../app'
        ],
        uploadDir: '../app/tmp',
        errorConfig: {
            dumpExceptions: true,
            showStack: true
        },
        dfhConfig: {
            urlPrefix : '/api/',
            authentication : ensureAuthenticated
        }
    },
    production: {
        name: 'Production',
        db: 'mongodb://192.168.1.7/forms-ng_prod',
        port: process.env.PORT || 8090,
        statics: [
            '../dist',
            '../app'
        ],
        uploadDir: '../dist/tmp',
        errorConfig: {
        },
        dfhConfig: {
            urlPrefix : '/api/',
            authentication : ensureAuthenticated
        }
    }
};

function addStatics (app) {
    config.statics.forEach( function (entry) {
        console.log(chalk.cyan('adding static path %s'), entry);
        app.use(express.static(path.join(__dirname, entry)));
    });
}

// Copy the schemas to somewhere they can be served
function copySchemas () {
    var cmd = [
        'cp',
        path.join(__dirname, '../server/models/*'),
        path.join(__dirname, '../app/code/')
    ].join(' ');

    exec(cmd, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('Error copying models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
        }
    });
}

var ensureAuthenticated = function (req, res, next) {
    // Here you can do authentication using things like
    //      req.ip
    //      req.route
    //      req.url
    if (true) { return next(); }
    res.status(401).send('No Authentication Provided');
};

function handleCrawlers(req,res,next) {
    if (req.url.slice(0,22) === '/?_escaped_fragment_=/') {
        fs.readFile(__dirname + '/seo/' + req.url.slice(22), 'utf8', function (err,data) {
            if (err) {
                res.send(403,'Not crawlable');
            } else {
                res.send(200, data);
            }
        });
    } else {
        next();
    }
}

function useHtml5Mode () {
    // Serve the static files.  This kludge is to support dev and production mode - for a better way to do it see
    // https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
    app.get(/^\/(scripts|partials|bower_components|demo|img|js)\/(.+)$/,function(req,res,next) {
        fs.realpath(__dirname + '/../app/' + req.params[0] + '/' + req.params[1], function (err, result) {
            if (err) {
                fs.realpath(__dirname + '/../dist/' + req.params[0] + '/' + req.params[1], function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        res.sendfile(result);
                    }
                });
            } else {
                res.sendfile(result);
            }
        });
    });
    app.all('/*', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendfile('index.html', { root: __dirname + '/../app/' });
    });
}


// Configuration
var env = process.env.NODE_ENV || 'development';
var config = cfg[env];
var app = module.exports = express();

app.configure(function(){
    console.log('Initializing...');
    app.use(express.bodyParser({
        uploadDir: path.join(__dirname, config.uploadDir),
        keepExtensions: true
    }));
    app.get('*',handleCrawlers);
    app.use(express.methodOverride());
    app.use(app.router);
    addStatics(app);
    copySchemas();
    app.use(express.errorHandler(config.errorConfig));
    mongoose.connect(config.db);
});

app.configure('test', function(){
    var data_path = path.join(__dirname, '../test/e2edata');
    var data_files = fs.readdirSync(data_path);
    data_files.forEach(function (file) {
        var fname = data_path+'/'+file;
        if (fs.statSync(fname).isFile()) {
            exec('mongoimport --db forms-ng_test --drop --collection '+ file.slice(0,1)+'s --jsonArray < ' + fname,
                function (error, stdout, stderr) {
                    if (error !== null) {
                        console.log('Error importing models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
                    }
                });
        }
    });
});

var models = [];

function slurpModelsFrom (pattern) {
    var deferred = Q.defer();
    glob(path.join(__dirname, pattern), function (err, files) {
        if (err) {
            console.log(chalk.red('Globbing error at server startup: %s'), err);
            return deferred.reject(err);
        }
        for (var i = 0; i < files.length; i++) {
            console.log(chalk.cyan('Creating model from %s'), files[i]);
            try {
                var name = files[i].replace(/^.*[\\\/]/, '').slice(0,-3);
                var model = require(files[i]);
                models.push({
                    name: name,
                    model: model
                });
            } catch (e) {}
        }
        deferred.resolve(true);
    });
    return deferred.promise;
};

slurpModelsFrom('models/*.js')
    .then(function (success) {
        var DataFormHandler = new (require(path.join(__dirname, 'lib/data_form.js')))(app, config.dfhConfig);
        models.forEach(function (model) {
        //mongoose.modelNames().forEach(function (modelName) {
            console.log(chalk.yellow('DataForm resource: %s'), model.name);
            DataFormHandler.addResource(model.name, model.model);
        });
    })
    .then(function (success) {
        // If you want to use HTML5Mode uncomment the section below and modify
        // app/demo.js so that the call to urlService.setOptions includes {html5Mode: true}
        // app.configure(useHtml5Mode);
        app.listen(config.port);
        console.log(chalk.cyan('Express server listening on port %d in %s mode'), config.port, env);
    });






































