/**
 * Module dependencies.
 */

var express = require('express')
    , fs = require('fs')
    , mongoose = require('mongoose')
    , https = require('https');


var app = module.exports = express();

// Configuration

app.configure(function(){

    app.use(express.bodyParser({
        uploadDir: __dirname + '/../app/tmp',
        keepExtensions: true
    }));
    app.use(express.methodOverride());

    app.use(app.router);
    app.use(express.static(__dirname + '/../app'));


});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    mongoose.connect('mongodb://localhost/forms-ng_dev');
});

app.configure('production', function(){
    console.log('Production mode');
    app.use(express.errorHandler());
    mongoose.connect('mongodb://theworld:7gY^tr5^ERf$r@linus.mongohq.com:10053/forms-ng');
});

//// Bootstrap models
var DataFormHandler = new (require(__dirname + '/lib/data_form.js'))(app, {urlPrefix : '/api/'});

var models_path = __dirname + '/models';
var models_files = fs.readdirSync(models_path);
models_files.forEach(function(file){
    var fname = models_path+'/'+file;
    if (fs.statSync(fname).isFile()) {
        DataFormHandler.addResource(file.slice(0,-3), require(fname));
    }
});

app.get('/api/models', function(req, res){
    res.send(DataFormHandler.resources);
});


var port;

port = process.env.PORT || 3000 ;
app.listen(port);
console.log("Express server listening on port %d in %s mode", port, app.settings.env);
