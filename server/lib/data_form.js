// This part of forms-angular borrows _very_ heavily from https://github.com/Alexandre-Strzelewicz/angular-bridge

var _ = require('underscore'),
    util = require('util'),
    extend = require('node.extend'),// needed for deep copy even though underscore has an extend
    async = require('async'),
    url = require('url'),
    mongoose = require('mongoose'),
    debug = true;

mongoose.set('debug',debug);


function logTheAPICalls (req, res, next) {
    console.log('API     : ' + req.method + ' ' + req.url);
    next();
}

function processArgs(options, array) {
    if (options.authentication) {
        array.splice(1, 0, options.authentication)
    }
    if (debug) {
        array.splice(1, 0, logTheAPICalls)
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

    this.app.get.apply(this.app, processArgs(this.options, ['search', this.searchAll()]));
};

/**
 * Exporting the Class
 */
module.exports = exports = DataForm;

DataForm.prototype.getListFields = function (resource, doc) {
    var listFields = Object.keys(resource.model.schema.paths);
    var display = '';
    for (var listElement = 0 ; listElement < 2; listElement++) {
        display += doc[listFields[listElement]] + ' ';
    }
    return display;
};

DataForm.prototype.internalSearch = function (req, resourcesToSearch, limit, callback) {
    var searches = [],
        resourceCount = resourcesToSearch.length,
        url_parts = url.parse(req.url, true),
        searchFor = url_parts.query.q,
        filter = url_parts.query.f;
    if (filter) {filter = JSON.parse(filter)}

    for (var i = 0; i < resourceCount; i++) {
        var resource = resourcesToSearch[i];
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
            if (filter) {
                extend(searchDoc, filter);
                if (filter[item.field]) {
                    delete searchDoc[item.field];
                    var obj1 = {}, obj2 = {};
                    obj1[item.field] = filter[item.field];
                    obj2[item.field] = {$regex:'^'+searchFor};
                    searchDoc['$and'] = [obj1, obj2];
                } else {
                    searchDoc[item.field] = {$regex:'^'+searchFor};
                }
            } else {
                searchDoc[item.field] = {$regex:'^'+searchFor};
            }

            // The +10 in the next line is an arbitrary safety zone for situations where items that match the string
            // in more than one index get filtered out.
            // TODO : Figure out a better way to deal with this
            that.filteredFind(item.resource, req, searchDoc, limit + 10, null, function(err, docs) {
                if (!err && docs && docs.length > 0) {
                    for (var k = 0; k < docs.length && results.length < limit; k++) {
                        var resultObject = {id:docs[k]._id, text: that.getListFields(item.resource,docs[k])};
                        if (resourceCount > 1) {resultObject.resource = item.resource.resource_name;}
                        if (_.find(results,function(obj){ return obj.id.id === resultObject.id.id}) === undefined) {
                            results.push(resultObject);
                        }
                    }
                    if (results.length === limit) {
                        moreCount += docs.length - k;
                    }
                }
                cb(err)
            })
        }
        , function (err) {
            callback({results:results, moreCount:moreCount});
        }
    );
};

DataForm.prototype.search = function (req, res, next) {
    return _.bind(function (req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }

        this.internalSearch(req, [req.resource], 10, function(resultsObject) {
            res.send(resultsObject);
        });
    }, this);
};

DataForm.prototype.searchAll = function (req, res) {
    return _.bind(function (req, res) {
        this.internalSearch(req, this.resources, 10, function(resultsObject) {
            res.send(resultsObject);
        });
    }, this);
};

/**
 * Registers all REST routes with the provided `app` object.
 */
DataForm.prototype.registerRoutes = function () {

    this.app.get.apply(this.app, processArgs(this.options, ['search/:resourceName', this.search()]));

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

    // return the List attributes for a record - used by select2
    this.app.all.apply(this.app, processArgs(this.options, [':resourceName/:id/list', this.entity()]));
    this.app.get.apply(this.app, processArgs(this.options, [':resourceName/:id/list', this.entityList()]));
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

/**
 * Renders a view with the list of all docs.
 */
DataForm.prototype.collectionGet = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            return next();
        }

        var url_parts = url.parse(req.url, true);
        var findParam = url_parts.query.f ?  JSON.parse(url_parts.query.f) : {};
        var self = this;

        this.filteredFind(req.resource, req, findParam, null, null, function(err, docs) {
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

DataForm.prototype.entityList = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            return next();
        }
        return res.send({list:this.getListFields(req.resource, req.doc)});
    }, this);
};

