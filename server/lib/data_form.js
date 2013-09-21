// This part of forms-angular borrows _very_ heavily from https://github.com/Alexandre-Strzelewicz/angular-bridge
// (now https://github.com/Unitech/angular-bridge

var _ = require('underscore'),
    util = require('util'),
    extend = require('node.extend'),// needed for deep copy even though underscore has an extend
    async = require('async'),
    url = require('url'),
    mongoose = require('mongoose'),
    debug = false;

mongoose.set('debug', debug);

function logTheAPICalls(req, res, next) {
    console.log('API     : ' + req.method + ' ' + req.url + '  [ ' + JSON.stringify(req.body) + ' ]');
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
        urlPrefix: '/api/'
    }, options || {});
    this.resources = [ ];
    this.searchFunc = async.forEach;
    this.registerRoutes();

    this.app.get.apply(this.app, processArgs(this.options, ['search', this.searchAll()]));
};

/**
 * Exporting the Class
 */
module.exports = exports = DataForm;

DataForm.prototype.getListFields = function (resource, doc) {
    var display = ''
        , listElement = 0
        , listFields = resource.options.listFields;

    if (listFields) {
        for (; listElement < listFields.length; listElement++) {
            display += doc[listFields[listElement].field] + ' ';
        }
    } else {
        listFields = Object.keys(resource.model.schema.paths);
        for (; listElement < 2; listElement++) {
            display += doc[listFields[listElement]] + ' ';
        }
    }
    return display.trim();
};

/**
 * Registers all REST routes with the provided `app` object.
 */
DataForm.prototype.registerRoutes = function () {

    this.app.get.apply(this.app, processArgs(this.options, ['models', this.models()]));
    this.app.get.apply(this.app, processArgs(this.options, ['search/:resourceName', this.search()]));

    this.app.get.apply(this.app, processArgs(this.options, ['schema/:resourceName', this.schema()]));
    this.app.get.apply(this.app, processArgs(this.options, ['schema/:resourceName/:formName', this.schema()]));
    this.app.get.apply(this.app, processArgs(this.options, ['report/:resourceName', this.report()]));
    this.app.get.apply(this.app, processArgs(this.options, ['report/:resourceName/:reportName', this.report()]));

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

    extend(resource.options, this.preprocess(resource.model.schema.paths, null));

    if (resource.options.searchImportance) {
        this.searchFunc = async.forEachSeries;
    }
    if (this.searchFunc === async.forEachSeries) {
        this.resources.splice(_.sortedIndex(this.resources, resource, function (obj) {
            return obj.options.searchImportance || 99
        }), 0, resource);
    } else {
        this.resources.push(resource);
    }
};

DataForm.prototype.getResource = function (name) {
    return _.find(this.resources, function (resource) {
        return resource.resource_name === name;
    });
};

DataForm.prototype.internalSearch = function (req, resourcesToSearch, limit, callback) {
    var searches = [],
        resourceCount = resourcesToSearch.length,
        url_parts = url.parse(req.url, true),
        searchFor = url_parts.query.q,
        filter = url_parts.query.f;

    function translate(string, array, context) {
        if (array) {
            var translation = _.find(array, function(fromTo) {
                return fromTo.from === string && (!fromTo.context || fromTo.context === context)
            });
            if (translation) {
                string = translation.to;
            }
        }
        return string;
    }

    if (filter) {
        filter = JSON.parse(filter)
    }

    for (var i = 0; i < resourceCount; i++) {
        var resource = resourcesToSearch[i];
        if (resource.options.searchImportance !== false) {
            var schema = resource.model.schema;
            var indexedFields = [];
            for (j = 0; j < schema._indexes.length; j++) {
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
            for (m = 0; m < indexedFields.length; m++) {
                searches.push({resource: resource, field: indexedFields[m] })
            }
        }
    }
    var that = this,
        results = [],
        moreCount = 0;
    this.searchFunc(
        searches
        , function (item, cb) {
            var searchDoc = {};
            if (filter) {
                extend(searchDoc, filter);
                if (filter[item.field]) {
                    delete searchDoc[item.field];
                    var obj1 = {}, obj2 = {};
                    obj1[item.field] = filter[item.field];
                    obj2[item.field] = {$regex: '^' + searchFor, $options: 'i'};
                    searchDoc['$and'] = [obj1, obj2];
                } else {
                    searchDoc[item.field] = {$regex: '^' + searchFor, $options: 'i'};
                }
            } else {
                searchDoc[item.field] = {$regex: '^' + searchFor, $options: 'i'};
            }

            // The +30 in the next line is an arbitrary safety zone for situations where items that match the string
            // in more than one index get filtered out.
            // TODO : Figure out a better way to deal with this
            that.filteredFind(item.resource, req, null, searchDoc, item.resource.options.searchOrder, limit + 30, null, function (err, docs) {
                if (!err && docs && docs.length > 0) {
                    for (var k = 0; k < docs.length && results.length < limit; k++) {

                        // Check we don't already have them in list
                        var thisId = docs[k]._id;
                        if (_.find(results, function (obj) {
                            return obj.id.id === thisId.id
                        }) === undefined) {
                            var resultObject;

                            // Use special listings format if defined
                            var specialListingFormat = item.resource.options.searchResultFormat;
                            if (specialListingFormat) {
                                resultObject = specialListingFormat.apply(docs[k]);
                                if (item.resource.options.localisationData) {
                                    resultObject.resource = translate(resultObject.resource,item.resource.options.localisationData,'resource');
                                    resultObject.resourceText = translate(resultObject.resourceText,item.resource.options.localisationData,'resourceText');
                                }
                                results.splice(_.sortedIndex(results, resultObject, function (obj) {
                                    return obj.weighting
                                }), 0, resultObject)
                            } else {
                                resultObject = {
                                    id: thisId,
                                    weighting: '~~',
                                    text: that.getListFields(item.resource, docs[k])
                                };
                                if (resourceCount > 1) {
                                    resultObject.resource = resultObject.resourceText = item.resource.resource_name;
                                }
                                results.push(resultObject);
                            }
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
            // Strip weighting from the results
            results = _.map(results, function(aResult){delete aResult.weighting; return aResult});
            callback({results: results, moreCount: moreCount});
        }
    );
};

DataForm.prototype.search = function (req, res, next) {
    return _.bind(function (req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }

        this.internalSearch(req, [req.resource], 10, function (resultsObject) {
            res.send(resultsObject);
        });
    }, this);
};

DataForm.prototype.searchAll = function (req, res) {
    return _.bind(function (req, res) {
        this.internalSearch(req, this.resources, 10, function (resultsObject) {
            res.send(resultsObject);
        });
    }, this);
};

DataForm.prototype.models = function (req, res, next) {


    var that = this;

    return function (req, res, next) {
        res.send(that.resources);
    };

    // return _.bind(function (req, res, next) {
    //     res.send(this.resources)
    // }, this);
};


DataForm.prototype.renderError = function (err, redirectUrl, req, res) {
    if (typeof err === "string") {
        res.send(err)
    } else {
        res.send(err.message)
    }
};

DataForm.prototype.redirect = function (address, req, res) {
    res.send(address);
};

DataForm.prototype.preprocess = function (paths, formSchema) {
    var outPath = {},
        hiddenFields = [],
        listFields = [];
    for (var element in paths) {
        if (paths.hasOwnProperty(element) && element != '__v') {
            // check for schemas
            if (paths[element].schema) {
                var subSchemaInfo = this.preprocess(paths[element].schema.paths);
                outPath[element] = {schema: subSchemaInfo.paths};
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
                if (paths[element].options.secure) {
                    hiddenFields.push(element);
                }
                if (paths[element].options.list) {
                    listFields.push({field:element, params:paths[element].options.list})
                }
            }
        }
    }
    if (formSchema) {
        var vanilla = outPath;
        outPath = {};
        for (var fld in formSchema) {
            if (formSchema.hasOwnProperty(fld)) {
                if (!vanilla[fld]) {
                    throw new Error("No such field as " + fld + ".  Is it part of a sub-doc? If so you need the bit before the period.")
                }
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
    var returnObj = {paths: outPath};
    if (hiddenFields.length > 0) {
        returnObj.hide = hiddenFields;
    }
    if (listFields.length > 0) {
        returnObj.listFields = listFields;
    }
    return returnObj;
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
        var paths = this.preprocess(req.resource.model.schema.paths, formSchema).paths;
        res.send(JSON.stringify(paths));
    }, this);
};

DataForm.prototype.report = function () {
    return _.bind(function (req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }

        var reportSchema
            , self = this
            , url_parts = url.parse(req.url, true)
            , runPipeline;

        if (req.params.reportName) {
            reportSchema = req.resource.model.schema.statics['report'](req.params.reportName)
        } else {
            reportSchema = JSON.parse(url_parts.query.r);
        }

        // Replace parameters in pipeline
        var schemaCopy = {};
        extend(schemaCopy, reportSchema);
        schemaCopy.params = schemaCopy.params || [];

        self.doFindFunc(req, req.resource, function(err, queryObj) {

            if (err) {
                return self.renderError(new Error("There was a problem with the findFunc for model " + req.resource.modelName), null, req, res, next);
            } else {
                // Bit crap here switching back and forth to string
                runPipeline = JSON.stringify(schemaCopy.pipeline);
                for (var param in url_parts.query) {
                    if (param !== 'r') {             // we don't want to copy the whole report schema (again!)
                        schemaCopy.params[param].value = url_parts.query[param];
                    }
                }
                runPipeline = runPipeline.replace(/\"\(.+?\)\"/g, function(match){
                    param = schemaCopy.params[match.slice(2,-2)];
                    if (param.type === 'number') {
                        return param.value;
                    } else if (_.isObject(param.value)) {
                        return JSON.stringify(param.value);
                    } else if (param.value[0] = '{') {
                        return param.value;
                    } else {
                        return '"'+param.value+'"';
                    }
                });
                runPipeline = JSON.parse(runPipeline);

                // Replace variables that cannot be serialised / deserialised.  Bit of a hack, but needs must...
                // Anything formatted 1800-01-01T00:00:00.000Z is converted to a Date
                // Only handles the cases I need for now
                // TODO: handle arrays etc
                var hackVariables = function(obj) {
                    for (var prop in obj) {
                        if (typeof obj[prop] === 'string') {
                            if (obj[prop].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
                                obj[prop] = new Date(obj[prop])
                            }
                        } else if (_.isObject(obj[prop])) {
                            hackVariables(obj[prop]);
                        }
                    }
                };

                for (var pipelineSection = 0; pipelineSection < runPipeline.length; pipelineSection++) {
                    if (runPipeline[pipelineSection]['$match']) {
                        hackVariables(runPipeline[pipelineSection]['$match']);
                    }
                }

                if (queryObj) {
                    runPipeline.unshift({$match:queryObj});
                }

                var toDo = {runAggregation: function(cb,results) {
                    req.resource.model.aggregate(runPipeline, cb)
                }
                };

                // if we need to do any column translations add the function to the tasks list
                if (reportSchema.columnTranslations) {
                    toDo.apply_translations = ['runAggregation', function(cb,results) {
                        reportSchema.columnTranslations.forEach(function(columnTranslation){
                            results.runAggregation.forEach(function(resultRow){
                                var thisTranslation = _.find(columnTranslation.translations, function(option){
                                    return resultRow[columnTranslation.field].toString() === option.value.toString()
                                });
                                resultRow[columnTranslation.field] = thisTranslation.display;
                            })
                        });
                        cb(null,null);
                    }];

                    // if any of the column translations are refs, set up the tasks to look up the values and populate the translations
                    for (var i=0; i < reportSchema.columnTranslations.length; i++) {
                        var thisColumnTranslation = reportSchema.columnTranslations[i]
                            , translateName = thisColumnTranslation.field;
                        if (translateName){
                            if (thisColumnTranslation.ref) {
                                var lookup = self.getResource(thisColumnTranslation.ref);
                                if (lookup) {
                                    if (toDo[translateName]) {
                                        return self.renderError(new Error("Cannot have two columnTranslations for field " + translateName ), null, req, res, next);
                                    } else {
                                        thisColumnTranslation.translations = thisColumnTranslation.translations || [];
                                        toDo[translateName] = function(cb,results) {lookup.model.find({},{},{lean:true},function(err,findResults){
                                            if (err) {
                                                cb(err);
                                            } else {
                                                for (var j=0; j<findResults.length;j++){
                                                    thisColumnTranslation.translations[j] = {value: findResults[j]._id, display: self.getListFields(lookup, findResults[j])};
                                                }
                                                cb(null,null);
                                            }
                                        })};
                                        toDo.apply_translations.unshift(translateName);  // Make sure we populate lookup before doing translation
                                    }
                                } else {
                                    return self.renderError(new Error("Invalid ref property of " + thisColumnTranslation.ref + " in columnTranslations " + translateName ), null, req, res, next);
                                }
                            } else if (!thisColumnTranslation.translations) {
                                return self.renderError(new Error("A column translation needs a ref or a translations property - " + translateName + " has neither" ), null, req, res, next);
                            }
                        } else {
                            return self.renderError(new Error("A column translation needs a field property" ), null, req, res, next);
                        }
                    }
                }

                async.auto(toDo, function(err, results){
                    if (err) {
                        return self.renderError(err, null, req, res, next);
                    } else {
                        // TODO: Could loop through schemaCopy.params and just send back the values
                        res.send({success:true, schema:reportSchema, report: results.runAggregation, paramsUsed: schemaCopy.params});
                    }
                });
            }
        });
    }, this);
};

DataForm.prototype.saveAndRespond = function (req, res) {

    function internalSave(doc) {
        doc.save(function (err, doc2) {
            if (err) {
                var err2 = {status: 'err'};
                if (!err.errors) {
                    err2.message = err.message;
                } else {
                    extend(err2, err);
                }
                if (debug) {
                    console.log('Error saving record: ' + JSON.stringify(err2))
                }
                res.send(400, err2);
            } else {
                res.send(doc2);
            }
        });
    }

    var doc = req.doc;
    if (typeof req.resource.options.onSave === "function") {

        req.resource.options.onSave(doc, req, function (err) {
            if (err) {
                throw err;
            }
            internalSave(doc);
        })
    } else {
        internalSave(doc);
    }
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
 * Renders a view with the list of docs, which may be filtered by the f query parameter
 */
DataForm.prototype.collectionGet = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            return next();
        }

        var url_parts = url.parse(req.url, true);
        try {
            var aggregationParam    = url_parts.query.a ? JSON.parse(url_parts.query.a) : null;
            var findParam           = url_parts.query.f ? JSON.parse(url_parts.query.f) : {};
            var limitParam          = url_parts.query.l ? JSON.parse(url_parts.query.l) : {};
            var skipParam           = url_parts.query.s ? JSON.parse(url_parts.query.s) : {};
            var orderParam          = url_parts.query.o ? JSON.parse(url_parts.query.o) : req.resource.options.listOrder;

            var self = this;

            this.filteredFind(req.resource, req, aggregationParam, findParam, orderParam, limitParam, skipParam, function (err, docs) {
                if (err) {
                    return self.renderError(err, null, req, res, next);
                } else {
                    res.send(docs);
                }
            });
        } catch (e) {
            res.send(e);
        }
    }, this);
};

DataForm.prototype.doFindFunc = function(req, resource, cb) {
    if (resource.options.findFunc) {
        resource.options.findFunc(req, cb)
    } else {
        cb(null);
    }
};

DataForm.prototype.filteredFind = function (resource, req, aggregationParam, findParam, sortOrder, limit, skip, callback) {

    var that = this
        , hidden_fields = this.generateHiddenFields(resource, false);

    function doAggregation(cb) {
        if (aggregationParam) {
            resource.model.aggregate(aggregationParam, function (err, aggregationResults) {
                if (err) {
                    throw err
                } else {
                    cb(_.map(aggregationResults, function (obj) {
                        return obj._id
                    }));
                }
            })
        } else {
            cb([]);
        }
    }

    doAggregation(function (idArray) {
        if (aggregationParam && idArray.length === 0) {
            callback(null, [])
        } else {
            that.doFindFunc(req, resource, function (err, queryObj) {
                if (err) {
                    callback(err)
                } else {
                    var query = resource.model.find(queryObj);
                    if (idArray.length > 0) {
                        query = query.where('_id').in(idArray)
                    }
                    query = query.find(findParam).select(hidden_fields);
                    if (limit) query = query.limit(limit);
                    if (skip) query = query.skip(skip);
                    if (sortOrder) query = query.sort(sortOrder);
                    query.exec(callback);
                }
            })
        }
    })
};

DataForm.prototype.collectionPost = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            next();
            return;
        }
        if (!req.body) throw new Error('Nothing submitted.');

        var cleansedBody = this.cleanseRequest(req);
        req.doc = new req.resource.model(cleansedBody);

        this.saveAndRespond(req, res);
    }, this);
};

/**
 * Generate an object of fields to not expose
 **/
DataForm.prototype.generateHiddenFields = function (resource, state) {
    var hidden_fields = {};

    if (resource.options['hide'] !== undefined) {
        resource.options.hide.forEach(function (dt) {
            hidden_fields[dt] = state;
        });
    }
    return hidden_fields;
};

/** Sec issue
 * Cleanse incoming data to avoid overwrite and POST request forgery
 * (name may seem weird but it was in French, so it is some small improvement!)
 */
DataForm.prototype.cleanseRequest = function (req) {
    var req_data = req.body,
        resource = req.resource;

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

        var hidden_fields = this.generateHiddenFields(req.resource, false);

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

DataForm.prototype.replaceHiddenFields = function (record, data) {
    var self = this;
    self._replacingHiddenFields = true;
    _.each(data, function (value, name) {
        if (_.isObject(value)) {
            self.replaceHiddenFields(record[name], value)
        } else {
            record[name] = value;
        }
    });
    delete self._replacingHiddenFields;
};

DataForm.prototype.entityPut = function () {
    return _.bind(function (req, res, next) {
        if (!req.resource) {
            next();
            return;
        }

        if (!req.body) throw new Error('Nothing submitted.');
        var cleansedBody = this.cleanseRequest(req)
            , that = this;

        // Merge
        _.each(cleansedBody, function (value, name) {
            req.doc[name] = (value === "") ? undefined : value;
        });

        if (req.resource.options.hide !== undefined) {
            var hidden_fields = this.generateHiddenFields(req.resource, true);
            hidden_fields._id = false;
            req.resource.model.findById(req.doc._id, hidden_fields, {lean: true}, function (err, data) {
                that.replaceHiddenFields(req.doc, data);
                that.saveAndRespond(req, res);
            })
        } else {
            that.saveAndRespond(req, res);
        }
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
        return res.send({list: this.getListFields(req.resource, req.doc)});
    }, this);
};

