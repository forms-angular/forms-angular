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

    this.app.get(this.options.urlPrefix + 'schema/:resourceName', this.schema());

    this.app.all(this.options.urlPrefix + ':resourceName', this.collection());
    this.app.get(this.options.urlPrefix + ':resourceName', this.collectionGet());

    this.app.post(this.options.urlPrefix + ':resourceName', this.collectionPost());

    this.app.all(this.options.urlPrefix + ':resourceName/:id', this.entity());
    this.app.get(this.options.urlPrefix + ':resourceName/:id', this.entityGet());

    // You can POST or PUT to update data
    this.app.post(this.options.urlPrefix + ':resourceName/:id', this.entityPut());
    this.app.put(this.options.urlPrefix + ':resourceName/:id', this.entityPut());

    this.app.delete(this.options.urlPrefix + ':resourceName/:id', this.entityDelete());
};

DataForm.prototype.addResource = function(resource_name, model, options) {
    var resource = {
        resource_name: resource_name,
        model: model,
        options : options || null
    };

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

DataForm.prototype.preprocess = function (paths) {
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
    return outPath;
};

DataForm.prototype.schema = function() {
    return _.bind(function(req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }
        var paths = this.preprocess(req.resource.model.schema.paths);
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

        var self = this;
        var hidden_fields = this.generateHiddenFields(req.resource);
        var query = req.resource.model.find().select(hidden_fields);

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

        doc.save(function(err) {
            if (err) { error(err); return; }
            res.send(doc);
        });
    }, this);
};

/**
 * Generate an object of fields to not expose
 */
DataForm.prototype.generateHiddenFields = function(resource) {
    var hidden_fields = {};

    if (resource.options == null || typeof resource.options['hide'] == 'undefined')
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


    if (resource.options == null || typeof resource.options['hide'] == 'undefined')
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

        var epured_body = this.epureRequest(req.body, req.resource);

        // Merge
        _.each(epured_body, function(value, name) {
            req.doc[name] = value;
        });

        req.doc.save(function(err) {
            if (err) {
                return res.send({success:false});
            }
            return res.send(req.doc);
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
