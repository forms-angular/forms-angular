// This part of forms-angular borrows _very_ heavily from https://github.com/Alexandre-Strzelewicz/angular-bridge

var _ = require('underscore'),
    util = require('util'),
    extend = require('node.extend'),
    async = require('async');

function processArgs(options, array) {
    if (options.authentication) {
        array.splice(1, 0, options.authentication)
    }
    array[0] = options.urlPrefix + array[0];
    return array;
}

var DataForm = function (app, options) {
    this.app = app;
    this.options = _.extend({
        urlPrefix: '/'
    }, options || {});
    this.resources = [ ];
    this.registerRoutes();

    this.app.get.apply(this.app, processArgs(this.options, ['search', this.search()]));
};

/**
 * Exporting the Class
 */
module.exports = exports = DataForm;

DataForm.prototype.search = function (req, res) {
    return _.bind(function (req, res) {
        var searches = [],
            searchFor = this.getSearchParam(req),
            resourceIndexes = [];
        // TODO: Strip out the index data when adding the resource
        for (var i = 0; i < this.resources.length; i++) {
            var resource = this.resources[i];
            var schema = resource.model.schema;
            var indexedFields = [];
            for (j = 0; j < schema._indexes.length ; j++) {
                var attributes = schema._indexes[j][0];
                var field = Object.keys(attributes)[0];
                if (indexedFields.indexOf(field) == -1) {
                    indexedFields.push(field)
                }
            }
            for (var path in schema.paths) {
                if (path != "_id" && schema.paths.hasOwnProperty(path)) {
                    if (schema.paths[path]._index && !schema.paths[path].options.noSearch) {
                        if (indexedFields.indexOf(path) == -1) {
                            indexedFields.push(path)
                        }
                    }
                }
            }
            for (m=0; m < indexedFields.length ; m++) {
                searches.push({resource:resource, field: indexedFields[m] })
            }
        }
        var that = this,
            results = [],
            moreCount = 0;
        async.forEach(
            searches
            , function (item, cb) {
                var searchDoc = {};
                searchDoc[item.field] = {$regex:'^'+searchFor};
                that.filteredFind(item.resource, req, searchDoc, 11, null, function(err, docs) {
                    var listFields = Object.keys(item.resource.model.schema.paths);
                    if (!err && docs && docs.length > 0) {
                        for (var k = 0; k < docs.length && results.length < 10; k++) {
                            var display = '';
                            for (var listElement = 0 ; listElement < 2; listElement++) {
                                display += docs[k][listFields[listElement]] + ' ';
                            }
                            results.push({resource: item.resource.resource_name, id:docs[k]._id, display: display});
                        }
                        if (results.length === 10) {
                            moreCount += docs.length - k;
                        }
                    }
                    cb(err)
                })
            }
            , function (err) {
                res.send({results:results, moreCount:moreCount});
            }
        );
    }, this);
};

/**
 * Registers all REST routes with the provided `app` object.
 */
DataForm.prototype.registerRoutes = function () {

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
DataForm.prototype.addResource = function (resource_name, model, options) {
    var resource = {
        resource_name: resource_name,
        options: options || {}
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

DataForm.prototype.getResource = function (name) {
    return _.find(this.resources, function (resource) {
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
                outPath[element] = {schema: this.preprocess(paths[element].schema.paths)};
                if (paths[element].options.form) {
                    outPath[element].options = {form: extend(true, {}, paths[element].options.form)};
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
                outPath[element] = extend(true, {}, paths[element]);
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

DataForm.prototype.schema = function () {
    return _.bind(function (req, res, next) {
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
 * All entities REST functions have to go through this first.
 */
DataForm.prototype.collection = function () {
    return _.bind(function (req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }
        return next();
    }, this);
};

DataForm.prototype.getSearchParam = function (req) {
    var findParam = {},
        options = decodeURIComponent(req._parsedUrl.query).split('&');
    for (var i = 0; i < options.length; i++) {
        if (options[i].slice(0, 2).toLowerCase() === 'q=') {
            if (options[i].slice(2, 1) === '{') {
                findParam = JSON.parse(options[i].slice(2));
                break;
            } else {
                findParam = options[i].slice(2);
                break;
            }
        }
    }
    return findParam;
}

/**
 * Renders a view with the list of all docs.
 */
DataForm.prototype.collectionGet = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            return next();
        }
        var findParam = this.getSearchParam(req);
        var self = this;

        var docs = [],
            err;
        err = this.filteredFind(req.resource, req, findParam, null, null, function(err, docs) {
            if (err) {
                return self.renderError(err, null, req, res, next);
            } else {
                res.send(docs);
            }
        });
    }, this);
};

DataForm.prototype.filteredFind = function(resource, req, findParam, limit, skip, callback) {
    var hidden_fields = this.generateHiddenFields(resource);
    if (resource.options.findFunc) {
        resource.options.findFunc(req, function (err, query) {
            if (err) {
                callback(err);
            } else {
                if (Object.keys(findParam).length > 0) {
                    query = query.find(findParam);
                }
                query = query.select(hidden_fields);
                if (limit) query = query.limit(limit);
                if (skip) query = query.skip(skip);
                query.exec(callback)
            }
        });
    } else {
        var query;
        query = resource.model.find(findParam).select(hidden_fields);
        if (limit) query = query.limit(limit);
        if (skip) query = query.skip(skip);
        query.exec(callback);
    }
};

DataForm.prototype.collectionPost = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            next();
            return;
        }
        if (!req.body) throw new Error('Nothing submitted.');

        var epured_body = this.epureRequest(req.body, req.resource);
        var doc = new req.resource.model(epured_body);

        doc.save(function (err, doc2) {
            if (err) {
                res.send(400, {'status': 'err', 'message': err.message});
            } else {
                res.send(doc2);
            }
        });
    }, this);
};

/**
 * Generate an object of fields to not expose
 **/
DataForm.prototype.generateHiddenFields = function (resource) {
    var hidden_fields = {};

    if (typeof resource.options['hide'] == 'undefined')
        return {};

    resource.options.hide.forEach(function (dt) {
        hidden_fields[dt] = false;
    });
    return hidden_fields;
};


/** Sec issue
 * Epure incoming data to avoid overwritte and POST request forgery
 */
DataForm.prototype.epureRequest = function (req_data, resource) {


    if (typeof resource.options['hide'] == 'undefined')
        return req_data;

    var hidden_fields = resource.options.hide;

    _.each(req_data, function (num, key) {
        _.each(hidden_fields, function (fi) {
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
DataForm.prototype.entity = function () {
    return _.bind(function (req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            next();
            return;
        }

        var hidden_fields = this.generateHiddenFields(req.resource);

        //
        // select({_id : false}) invert the select process (hidde the _id field)
        //
        var query = req.resource.model.findOne({ _id: req.params.id }).select(hidden_fields);

        query.exec(function (err, doc) {
            if (err) {
                return res.send({
                    success: false,
                    err: util.inspect(err)
                });
            }
            else if (doc == null) {
                return res.send({
                    success: false,
                    err: 'Record not found'
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
DataForm.prototype.entityGet = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            return next();
        }
        return res.send(req.doc);
    }, this);
};


DataForm.prototype.entityPut = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            next();
            return;
        }

        if (!req.body) throw new Error('Nothing submitted.');
        var epured_body = this.epureRequest(req.body, req.resource);

        // Merge
        _.each(epured_body, function (value, name) {
            req.doc[name] = value;
        });

        req.doc.save(function (err, doc2) {
            if (err) {
                return res.send(400, {'status': 'err', 'message': err.message});
            } else {
                return res.send(doc2);
            }
        });

    }, this);
};

DataForm.prototype.entityDelete = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            next();
            return;
        }

        req.doc.remove(function (err) {
            if (err) {
                return res.send({success: false});
            }
            return res.send({success: true});
        });
    }, this);
};