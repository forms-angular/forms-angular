// This part of forms-angular borrows _very_ heavily from https://github.com/Alexandre-Strzelewicz/angular-bridge

var _ = require('underscore');
var util = require('util');

var DataForm = function(app, options) {
    this.app = app;
    this.options = _.extend({
        urlPrefix: '/'
    }, options || {});
    this.resources = [ ];
    this.registerRoutes();
};

/**
 * Exporting the Class
 */
module.exports = exports = DataForm;


/**
 * Registers all REST routes with the provided `app` object.
 */
DataForm.prototype.registerRoutes = function() {

    function processArgs(options, array) {
        if (options.authentication) {
           array.splice(1,0,options.authentication)
        }
        array[0] = options.urlPrefix + array[0];
        return array;
    }


    this.app.get.apply(this.app, processArgs(this.options, ['schema/:resourceName', this.schema()]));
    this.app.get.apply(this.app, processArgs(this.options, ['schema/:resourceName/:formName', this.schema()]));

    this.app.all.apply(this.app, processArgs(this.options, [':resourceName', this.collection()]));
    this.app.get.apply(this.app, processArgs(this.options, [':resourceName', this.collectionGet()]));

    this.app.post.apply(this.app, processArgs(this.options, [':resourceName', this.collectionPost()]));

    this.app.all.apply(this.app, processArgs(this.options, [':resourceName/:id', this.entity()]));
    this.app.get.apply(this.app, processArgs(this.options, [':resourceName/:id', this.entityGet()]));

    // You can POST or PUT to update data
    this.app.post.apply(this.app, processArgs(this.options, [':resourceName/:id', this.entityPut()]));
    this.app.put.apply(this.app, processArgs(this.options, [':resourceName/:id', this.entityPut()]));

    this.app.delete.apply(this.app, processArgs(this.options, [':resourceName/:id', this.entityDelete()]));
};

//    Add a resource, specifying the model and any options.
//    Models may include their own options, which means they can be passed through from the model file
DataForm.prototype.addResource = function(resource_name, model, options) {
    var resource = {
        resource_name: resource_name,
        options : options || {}
    };

    if (typeof model === "function") {
        resource.model = model;
    } else {
        resource.model = model.model;
        for (var prop in model) {
            if (model.hasOwnProperty(prop) && prop !== "model") {
                resource.options[prop] = model[prop];
            }
        }
    }

    this.resources.push(resource);
};

DataForm.prototype.getResource = function(name) {
    return _.find(this.resources, function(resource) {
        return resource.resource_name === name;
    });
};

DataForm.prototype.renderError = function (err, redirectUrl, req, res) {
    res.send(err);
};

DataForm.prototype.redirect = function (address, req, res) {
    res.send(address);
};

DataForm.prototype.preprocess = function (paths, formSchema) {
    var outPath = {};
    for (var element in paths) {
        if (paths.hasOwnProperty(element)) {
            // check for schemas
            if (paths[element].schema) {
                outPath[element] = {schema : this.preprocess(paths[element].schema.paths)};
                if (paths[element].options.form) {
                    outPath[element].options = {form: paths[element].options.form};
                }
            } else {
                // check for arrays
                var realType = paths[element].caster ? paths[element].caster : paths[element];
                if (!realType.instance) {

                    if (realType.options.type) {
                        var type = realType.options.type(),
                            typeType = typeof type;

                        if (typeType === "string") {
                            realType.instance = (Date.parse(type) !== NaN) ? "Date" : "String";
                        } else {
                            realType.instance = typeType;
                        }
                    }
                }
                outPath[element] = paths[element];
            }
        }
    }
    if (formSchema) {
        var vanilla = outPath;
        outPath = {};
        for (var fld in formSchema) {
            if (formSchema.hasOwnProperty(fld)) {
                outPath[fld] = vanilla[fld];
                outPath[fld].options = outPath[fld].options || {};
                for (var override in formSchema[fld]) {
                    if (formSchema[fld].hasOwnProperty(override)) {
                        if (!outPath[fld].options.form) {
                            outPath[fld].options.form = {};
                        }
                        outPath[fld].options.form[override] = formSchema[fld][override];
                    }
                }
            }
        }
    }
    return outPath;
};

DataForm.prototype.schema = function() {
    return _.bind(function(req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }
        var formSchema = null;
        if (req.params.formName) {
            formSchema = req.resource.model.schema.statics['form'](req.params.formName)
        }
        var paths = this.preprocess(req.resource.model.schema.paths, formSchema);
        res.send(JSON.stringify(paths));
    }, this);
};

/**
 * All entities rest functions have to go through this first.
 */
DataForm.prototype.collection = function() {
    return _.bind(function(req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }
        return next();
    }, this);
};

/**
 * Renders a view with the list of all docs.
 */
DataForm.prototype.collectionGet = function() {
    return _.bind(function(req, res, next) {
        if (!req.resource) {
            return next();
        }
        var findParam = {},
            options = decodeURIComponent(req._parsedUrl.query).split('&');
        for (var i = 0; i < options.length; i++) {
            if (options[i].slice(0,2).toLowerCase() === 'q=') {
                findParam = JSON.parse(options[i].slice(2));
            }
        }
        var self = this;
        var hidden_fields = this.generateHiddenFields(req.resource);
        var query;
        if (req.resource.options.findFunc) {
            query = req.resource.options.findFunc(findParam).select(hidden_fields);
        } else {
            query = req.resource.model.find(findParam).select(hidden_fields);
        }

        query.exec(function(err, docs) {
            if (err) {
                return self.renderError(err, null, req, res, next);
            }
            else {
                res.send(docs);
            }
        });
    }, this);
};

DataForm.prototype.collectionPost = function() {
    return _.bind(function(req, res, next) {
        if (!req.resource) { next(); return; }
        if (!req.body) throw new Error('Nothing submitted.');

        var epured_body = this.epureRequest(req.body, req.resource);
        var doc = new req.resource.model(epured_body);

        doc.save(function(err, doc2) {
            if (err) {
                res.send(400, {'status':'err','message':err.message});
            } else {
                res.send(doc2);
            }
        });
    }, this);
};

/**
 * Generate an object of fields to not expose
**/
DataForm.prototype.generateHiddenFields = function(resource) {
    var hidden_fields = {};

    if (typeof resource.options['hide'] == 'undefined')
        return {};

    resource.options.hide.forEach(function(dt) {
        hidden_fields[dt] = false;
    });
    return hidden_fields;
};


/** Sec issue
 * Epure incoming data to avoid overwritte and POST request forgery
 */
DataForm.prototype.epureRequest = function(req_data, resource) {


    if (typeof resource.options['hide'] == 'undefined')
        return req_data;

    var hidden_fields = resource.options.hide;

    _.each(req_data, function(num, key) {
        _.each(hidden_fields, function(fi) {
            if (fi == key)
                delete req_data[key];
        });
    });

    return req_data;
};


/*
 * Entity request goes there first
 * It retrieves the resource
 */
DataForm.prototype.entity = function() {
    return _.bind(function(req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) { next(); return; }

        var hidden_fields = this.generateHiddenFields(req.resource);

        //
        // select({_id : false}) invert the select process (hidde the _id field)
        //
        var query = req.resource.model.findOne({ _id: req.params.id }).select(hidden_fields);

        query.exec(function(err, doc) {
            if (err) {
                return res.send({
                    success : false,
                    err : util.inspect(err)
                });
            }
            else if (doc == null) {
                return res.send({
                    success : false,
                    err : 'Record not found'
                });
            }
            req.doc = doc;
            return next();
        });
    }, this);
};

/**
 * Gets a single entity
 *
 * @return {Function} The function to use as route
 */
DataForm.prototype.entityGet = function() {
    return _.bind(function(req, res, next) {
        if (!req.resource) {
            return next();
        }
        return res.send(req.doc);
    }, this);
};


DataForm.prototype.entityPut = function() {
    return _.bind(function(req, res, next) {
        if (!req.resource) { next(); return; }

        if (!req.body) throw new Error('Nothing submitted.');
console.log(JSON.stringify(req.body));
        var epured_body = this.epureRequest(req.body, req.resource);

        // Merge
        _.each(epured_body, function(value, name) {
            req.doc[name] = value;
        });

        req.doc.save(function(err, doc2) {
            if (err) {
                console.log(err);
                return res.send(400, {'status':'err','message':err.message});
            } else {
                return res.send(doc2);
            }
        });

    }, this);
};

DataForm.prototype.entityDelete = function() {
    return _.bind(function(req, res, next) {
        if (!req.resource) { next(); return; }

        req.doc.remove(function(err) {
            if (err) {
                return res.send({success : false});
            }
            return res.send({success : true});
        });
    }, this);
};
