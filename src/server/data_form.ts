import {Document, Error, Mongoose} from "mongoose";
import {Express} from "express";
import {fngServer} from "./index";
import Resource = fngServer.Resource;
import ListField = fngServer.ListField;
import FngOptions = fngServer.FngOptions;
import IFngPlugin = fngServer.IFngPlugin;
import IInternalSearchResult = fngServer.IInternalSearchResult;
import ISearchResultFormatter = fngServer.ISearchResultFormatter;
import Path = fngServer.Path;

// This part of forms-angular borrows _very_ heavily from https://github.com/Alexandre-Strzelewicz/angular-bridge
// (now https://github.com/Unitech/angular-bridge

const _ = require('lodash');
const util = require('util');
const extend = require('node.extend');
const async = require('async');

let debug = false;

function logTheAPICalls(req, res, next) {
    void (res);
    console.log('API     : ' + req.method + ' ' + req.url + '  [ ' + JSON.stringify(req.body) + ' ]');
    next();
}

function processArgs(options: any, array: Array<any>): Array<any> {
    if (options.authentication) {
        let authArray = _.isArray(options.authentication) ? options.authentication : [options.authentication];
        for (let i = authArray.length - 1; i >= 0; i--) {
            array.splice(1, 0, authArray[i]);
        }
    }
    if (debug) {
        array.splice(1, 0, logTheAPICalls);
    }
    array[0] = options.urlPrefix + array[0];
    return array;
}

export class FormsAngular {
    app: Express;
    mongoose: Mongoose;
    options: FngOptions;
    resources: Resource[];
    searchFunc: typeof async.forEach;

    constructor(mongoose: Mongoose, app: Express, options: FngOptions) {
        this.mongoose = mongoose;
        this.app = app;
        app.locals.formsAngular = app.locals.formsAngular || [];
        app.locals.formsAngular.push(this);
        mongoose.set('debug', debug);
        mongoose.Promise = global.Promise;
        this.options = _.extend({
            urlPrefix: '/api/'
        }, options || {});
        this.resources = [];
        this.searchFunc = async.forEach;

        const search = 'search/', schema = 'schema/', report = 'report/', resourceName = ':resourceName', id = '/:id';
        this.app.get.apply(this.app, processArgs(this.options, ['models', this.models()]));

        this.app.get.apply(this.app, processArgs(this.options, [search + resourceName, this.search()]));

        this.app.get.apply(this.app, processArgs(this.options, [schema + resourceName, this.schema()]));
        this.app.get.apply(this.app, processArgs(this.options, [schema + resourceName + '/:formName', this.schema()]));

        this.app.get.apply(this.app, processArgs(this.options, [report + resourceName, this.report()]));
        this.app.get.apply(this.app, processArgs(this.options, [report + resourceName + '/:reportName', this.report()]));

        this.app.get.apply(this.app, processArgs(this.options, [resourceName, this.collectionGet()]));
        this.app.post.apply(this.app, processArgs(this.options, [resourceName, this.collectionPost()]));

        this.app.get.apply(this.app, processArgs(this.options, [resourceName + id, this.entityGet()]));
        this.app.post.apply(this.app, processArgs(this.options, [resourceName + id, this.entityPut()]));  // You can POST or PUT to update data
        this.app.put.apply(this.app, processArgs(this.options, [resourceName + id, this.entityPut()]));
        this.app.delete.apply(this.app, processArgs(this.options, [resourceName + id, this.entityDelete()]));

        // return the List attributes for a record - used by select2
        this.app.get.apply(this.app, processArgs(this.options, [resourceName + id + '/list', this.entityList()]));

        this.app.get.apply(this.app, processArgs(this.options, ['search', this.searchAll()]));
        for (let pluginName in this.options.plugins) {
            if (this.options.plugins.hasOwnProperty(pluginName)) {
                let pluginObj: IFngPlugin = this.options.plugins[pluginName];
                this[pluginName] = pluginObj.plugin(this, processArgs, pluginObj.options);
            }
        }
    }

    getListFields(resource: Resource, doc: Document, cb) {

        function getFirstMatchingField(keyList, type?) {
            for (let i = 0; i < keyList.length; i++) {
                let fieldDetails = resource.model.schema['tree'][keyList[i]];
                if (fieldDetails.type && (!type || fieldDetails.type.name === type) && keyList[i] !== '_id') {
                    resource.options.listFields = [{field: keyList[i]}];
                    return doc[keyList[i]];
                }
            }
        }

        const that = this;
        let display = '';
        let listFields = resource.options.listFields;

        if (listFields) {
            async.map(listFields, function (aField, cbm) {
                if (typeof doc[aField.field] !== 'undefined') {
                    if (aField.params) {
                        if (aField.params.ref) {
                            let fieldOptions = (resource.model.schema['paths'][aField.field] as any).options;
                            if (typeof fieldOptions.ref === 'string') {
                                let lookupResource = that.getResource(fieldOptions.ref);
                                if (lookupResource) {
                                    let hiddenFields = that.generateHiddenFields(lookupResource, false);
                                    hiddenFields.__v = false;
                                    lookupResource.model.findOne({_id: doc[aField.field]}).select(hiddenFields).exec(function (err, doc2) {
                                        if (err) {
                                            cbm(err);
                                        } else {
                                            that.getListFields(lookupResource, doc2, cbm);
                                        }
                                    });
                                }
                            } else {
                                throw new Error('No support for ref type ' + aField.params.ref.type)
                            }
                        } else if (aField.params.params === 'timestamp') {
                            let date = that.extractTimestampFromMongoID(doc[aField.field]);
                            cbm(null, date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
                        }
                    } else {
                        cbm(null, doc[aField.field]);
                    }
                } else {
                    cbm(null, '')
                }
            }, function (err, results) {
                if (err) {
                    cb(err);
                } else {
                    if (results) {
                        cb(err, results.join(' ').trim())
                    } else {
                        console.log('No results ' + listFields);
                    }
                }
            });
        } else {
            const keyList = Object.keys(resource.model.schema['tree']);
            // No list field specified - use the first String field,
            display = getFirstMatchingField(keyList, 'String') ||
                // and if there aren't any then just take the first field
                getFirstMatchingField(keyList);
            cb(null, display.trim());
        }
    };

    newResource(model, options) {
        options = options || {};
        options.suppressDeprecatedMessage = true;
        let passModel = model;
        if (typeof model !== 'function') {
            passModel = model.model;
        }
        this.addResource(passModel.modelName, passModel, options);
    };

//    Add a resource, specifying the model and any options.
//    Models may include their own options, which means they can be passed through from the model file
    addResource(resourceName, model, options) {
        let resource: Resource = {
            resourceName: resourceName,
            options: options || {}
        };
        if (!resource.options.suppressDeprecatedMessage) {
            console.log('addResource is deprecated - see https://github.com/forms-angular/forms-angular/issues/39');
        }

        if (typeof model === 'function') {
            resource.model = model;
        } else {
            resource.model = model.model;
            for (const prop in model) {
                if (model.hasOwnProperty(prop) && prop !== 'model') {
                    resource.options[prop] = model[prop];
                }
            }
        }

        extend(resource.options, this.preprocess(resource, resource.model.schema['paths'], null));

        if (resource.options.searchImportance) {
            this.searchFunc = async.forEachSeries;
        }
        if (this.searchFunc === async.forEachSeries) {
            this.resources.splice(_.sortedIndexBy(this.resources, resource, function (obj) {
                return obj.options.searchImportance || 99;
            }), 0, resource);
        } else {
            this.resources.push(resource);
        }
    };

    getResource(name: string): Resource {
        return _.find(this.resources, function (resource) {
            return resource.resourceName === name;
        });
    };

    getResourceFromCollection(name: string): Resource {
        return _.find(this.resources, function (resource) {
            return resource.model.collection.collectionName === name;
        });
    };

    internalSearch(req, resourcesToSearch, includeResourceInResults, limit, callback) {
        if (typeof req.query === 'undefined') {
            req.query = {};
        }
        const timestamps = {sentAt: req.query.sentAt, startedAt: new Date().valueOf(), completedAt: undefined};
        let searches = [],
            resourceCount = resourcesToSearch.length,
            searchFor = req.query.q || '',
            filter = req.query.f;

        function translate(string, array, context) {
            if (array) {
                let translation = _.find(array, function (fromTo) {
                    return fromTo.from === string && (!fromTo.context || fromTo.context === context);
                });
                if (translation) {
                    string = translation.to;
                }
            }
            return string;
        }

        // return a string that determines the sort order of the resultObject
        function calcResultValue(obj) {

            function padLeft(score: number, reqLength: number, str = '0') {
                return new Array(1 + reqLength - String(score).length).join(str) + score;
            }

            let sortString = '';
            sortString += padLeft(obj.addHits || 9, 1);
            sortString += padLeft(obj.searchImportance || 99, 2);
            sortString += padLeft(obj.weighting || 9999, 4);
            sortString += obj.text;
            return sortString;
        }

        if (filter) {
            filter = JSON.parse(filter);
        }

        // See if we are narrowing down the resources
        let collectionName: string;
        let colonPos = searchFor.indexOf(':');
        switch (colonPos) {
            case -1:
                // Original behaviour = do nothing different
                break;
            case 0:
                // "Special search" - yet to be implemented
                break;
            default:
                collectionName = searchFor.slice(0, colonPos);
                searchFor = searchFor.slice(colonPos + 1, 999);
                if (searchFor === '') {
                    searchFor = '?';
                }
                break;
        }
        for (let i = 0; i < resourceCount; i++) {
            let resource = resourcesToSearch[i];
            if (resourceCount === 1 || (resource.options.searchImportance !== false && (!collectionName || collectionName === resource.resourceName || resource.options?.synonyms?.includes(collectionName.toLowerCase())))) {
                let schema = resource.model.schema;
                let indexedFields = [];
                for (let j = 0; j < schema._indexes.length; j++) {
                    let attributes = schema._indexes[j][0];
                    let field = Object.keys(attributes)[0];
                    if (indexedFields.indexOf(field) === -1) {
                        indexedFields.push(field);
                    }
                }
                for (let path in schema.paths) {
                    if (path !== '_id' && schema.paths.hasOwnProperty(path)) {
                        if (schema.paths[path]._index && !schema.paths[path].options.noSearch) {
                            if (indexedFields.indexOf(path) === -1) {
                                indexedFields.push(path);
                            }
                        }
                    }
                }
                if (indexedFields.length === 0) {
                    console.log('ERROR: Searching on a collection with no indexes ' + resource.resourceName);
                }
                for (let m = 0; m < indexedFields.length; m++) {
                    searches.push({resource: resource, field: indexedFields[m]});
                }
            }
        }
        const that = this;
        let results = [];
        let moreCount = 0;
        let searchCriteria;
        let searchStrings;
        let multiMatchPossible = false;
        if (searchFor === '?') {
            // interpret this as a wildcard (so there is no way to search for ?
            searchCriteria = null;
        } else {
            // THe snippet to escape the special characters comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            searchFor = searchFor.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
            multiMatchPossible = searchFor.includes(' ');
            if (multiMatchPossible) {
                searchStrings = searchFor.split(' ');
            }
            let modifiedSearchStr = multiMatchPossible ? searchStrings.join('|') : searchFor;
            searchFor = searchFor.toLowerCase();   // For later case-insensitive comparison

            // Removed the logic that preserved spaces when collection was specified because Louise asked me to.
            searchCriteria = {$regex: '^(' + modifiedSearchStr + ')', $options: 'i'};
        }

        let handleSearchResultsFromIndex = function (err, docs, item, cb) {

            function handleSingleSearchResult(aDoc: Document, cbdoc) {
                let thisId: string = aDoc._id.toString(),
                    resultObject: IInternalSearchResult,
                    resultPos: number;

                function handleResultsInList() {
                    if (multiMatchPossible) {
                        resultObject.matched = resultObject.matched || [];

                        // record the index of string that matched, so we don't count it against another field
                        for (let i = 0; i < searchStrings.length; i++) {
                            if (aDoc[item.field].toLowerCase().indexOf(searchStrings[i]) === 0) {
                                resultObject.matched.push(i);
                                break;
                            }
                        }
                    }

                    resultObject.searchImportance = item.resource.options.searchImportance || 99;
                    if (item.resource.options.localisationData) {
                        resultObject.resource = translate(resultObject.resource, item.resource.options.localisationData, "resource");
                        resultObject.resourceText = translate(resultObject.resourceText, item.resource.options.localisationData, "resourceText");
                        resultObject.resourceTab = translate(resultObject.resourceTab, item.resource.options.localisationData, "resourceTab");
                    }
                    results.splice(_.sortedIndexBy(results, resultObject, calcResultValue), 0, resultObject);
                    cbdoc(null);
                }

                // Do we already have them in the list?
                for (resultPos = results.length - 1; resultPos >= 0; resultPos--) {
                    if (results[resultPos].id.toString() === thisId) {
                        break;
                    }
                }
                if (resultPos >= 0) {
                    resultObject = Object.assign({}, results[resultPos]);
                    // If they have already matched then improve their weighting
                    if (multiMatchPossible) {
                        // record the index of string that matched, so we don't count it against another field
                        for (let i = 0; i < searchStrings.length; i++) {
                            if (!resultObject.matched.includes(i) && aDoc[item.field].toLowerCase().indexOf(searchStrings[i]) === 0) {
                                resultObject.matched.push(i);
                                resultObject.addHits = Math.max((resultObject.addHits || 9) - 1, 0);
                                // remove it from current position
                                results.splice(resultPos, 1);
                                // and re-insert where appropriate
                                results.splice(_.sortedIndexBy(results, resultObject, calcResultValue), 0, resultObject);
                                break;
                            }
                        }
                    }
                    cbdoc(null);
                } else {
                    // Otherwise add them new...
                    let addHits;
                    if (multiMatchPossible)
                        // If they match the whole search phrase in one index they get smaller addHits (so they sort higher)
                        if (aDoc[item.field].toLowerCase().indexOf(searchFor) === 0) {
                            addHits = 7;
                        }

                    // Use special listings format if defined
                    let specialListingFormat: ISearchResultFormatter = item.resource.options.searchResultFormat;
                    if (specialListingFormat) {
                        specialListingFormat.apply(aDoc, [req])
                            .then((resultObj) => {
                                resultObject = resultObj;
                                resultObject.addHits = addHits;
                                handleResultsInList();
                            });
                    } else {
                        that.getListFields(item.resource, aDoc, function (err, description) {
                            if (err) {
                                cbdoc(err);
                            } else {
                                (resultObject as any) = {
                                    id: aDoc._id,
                                    weighting: 9999,
                                    addHits,
                                    text: description
                                };
                                if (resourceCount > 1 || includeResourceInResults) {
                                    resultObject.resource = resultObject.resourceText = item.resource.resourceName;
                                }
                                handleResultsInList();
                            }
                        });
                    }
                }
            }

            if (!err && docs && docs.length > 0) {
                async.map(docs, handleSingleSearchResult, cb);
            } else {
                cb(err);
            }
        };

        this.searchFunc(
            searches,
            function (item, cb) {
                let searchDoc = {};
                if (filter) {
                    that.hackVariables(filter);
                    extend(searchDoc, filter);
                    if (filter[item.field]) {
                        delete searchDoc[item.field];
                        let obj1 = {}, obj2 = {};
                        obj1[item.field] = filter[item.field];
                        obj2[item.field] = searchCriteria;
                        searchDoc['$and'] = [obj1, obj2];
                    } else {
                        if (searchCriteria) {
                            searchDoc[item.field] = searchCriteria;
                        }
                    }
                } else {
                    if (searchCriteria) {
                        searchDoc[item.field] = searchCriteria;
                    }
                }

                /*
                The +200 below line is an (imperfect) arbitrary safety zone for situations where items that match the string in more than one index get filtered out.
                An example where it fails is searching for "e c" which fails to get a old record Emily Carpenter in a big dataset sorted by date last accessed as they
                are not returned within the first 200 in forenames so don't get the additional hit score and languish outside the visible results, though those visible
                results end up containing people who only match either c or e (but have been accessed much more recently).

                Increasing the number would be a short term fix at the cost of slowing down the search.
                 */
                // TODO : Figure out a better way to deal with this
                if (item.resource.options.searchFunc) {
                    item.resource.options.searchFunc(item.resource, req, null, searchDoc, item.resource.options.searchOrder, limit ? limit + 200 : 0, null, function (err, docs) {
                        handleSearchResultsFromIndex(err, docs, item, cb);
                    });
                } else {
                    that.filteredFind(item.resource, req, null, searchDoc, null, item.resource.options.searchOrder, limit ? limit + 200 : 0, null, function (err, docs) {
                        handleSearchResultsFromIndex(err, docs, item, cb);
                    });
                }

            },
            function (err) {
                if (err) {
                    callback(err);
                } else {
                    // Strip weighting from the results
                    results = _.map(results, function (aResult) {
                        delete aResult.weighting;
                        return aResult;
                    });
                    if (limit && results.length > limit) {
                        moreCount += results.length - limit;
                        results.splice(limit);
                    }
                    timestamps.completedAt = new Date().valueOf();
                    callback(null, {results, moreCount, timestamps});
                }
            }
        );
    };

    wrapInternalSearch(req, res, resourcesToSearch, includeResourceInResults, limit) {
        this.internalSearch(req, resourcesToSearch, includeResourceInResults, limit, function (err, resultsObject) {
            if (err) {
                res.status(400, err)
            } else {
                res.send(resultsObject);
            }
        });
    };

    search() {
        return _.bind(function (req, res, next) {
            if (!(req.resource = this.getResource(req.params.resourceName))) {
                return next();
            }
            this.wrapInternalSearch(req, res, [req.resource], false, 0);
        }, this);
    };

    searchAll() {
        return _.bind(function (req, res) {
            this.wrapInternalSearch(req, res, this.resources, true, 10);
        }, this);
    };

    models() {

        const that = this;

        return function (req, res) {
//    TODO: Make this less wasteful - we only need to send the resourceNames of the resources
            // Check for optional modelFilter and call it with the request and current list.  Otherwise just return the list.
            res.send(that.options.modelFilter ? that.options.modelFilter.call(null, req, that.resources) : that.resources);

        };
    };


    renderError(err, redirectUrl, req, res) {
        if (typeof err === 'string') {
            res.send(err);
        } else {
            res.send(err.message);
        }
    };

    redirect(address, req, res) {
        res.send(address);
    };

    applySchemaSubset(vanilla, schema) {
        let outPath;
        if (schema) {
            outPath = {};
            for (let fld in schema) {
                if (schema.hasOwnProperty(fld)) {
                    if (vanilla[fld]) {
                        outPath[fld] = _.cloneDeep(vanilla[fld]);
                        if (vanilla[fld].schema) {
                            outPath[fld].schema = this.applySchemaSubset(outPath[fld].schema, schema[fld].schema);
                        }
                    } else {
                        if (fld.slice(0, 8) === "_bespoke") {
                            outPath[fld] = {
                                "path": fld,
                                "instance": schema[fld]._type,
                            }
                        } else {
                            throw new Error('No such field as ' + fld + '.  Is it part of a sub-doc? If so you need the bit before the period.');
                        }
                    }
                    outPath[fld].options = outPath[fld].options || {};
                    for (const override in schema[fld]) {
                        if (schema[fld].hasOwnProperty(override)) {
                            if (override.slice(0, 1) !== '_') {
                                if (schema[fld].hasOwnProperty(override)) {
                                    if (!outPath[fld].options.form) {
                                        outPath[fld].options.form = {};
                                    }
                                    outPath[fld].options.form[override] = schema[fld][override];
                                }
                            }
                        }
                    }
                }
            }
        } else {
            outPath = vanilla;
        }
        return outPath;
    };

    preprocess(resource: Resource, paths, formSchema?) {
        let outPath: Path = {},
            hiddenFields = [],
            listFields = [];

        if (resource && resource.options && resource.options.idIsList) {
            paths['_id'].options = paths['_id'].options || {};
            paths['_id'].options.list = resource.options.idIsList;
        }
        for (let element in paths) {
            if (paths.hasOwnProperty(element) && element !== '__v') {
                // check for schemas
                if (paths[element].schema) {
                    let subSchemaInfo = this.preprocess(null, paths[element].schema.paths);
                    outPath[element] = {schema: subSchemaInfo.paths};
                    if (paths[element].options.form) {
                        outPath[element].options = {form: extend(true, {}, paths[element].options.form)};
                    }
                    // this provides support for entire nested schemas that wish to remain hidden
                    if (paths[element].options.secure) {
                        hiddenFields.push(element);
                    }
                    // to support hiding individual properties of nested schema would require us
                    // to do something with subSchemaInfo.hide here
                } else {
                    // check for arrays
                    let realType = paths[element].caster ? paths[element].caster : paths[element];
                    if (!realType.instance) {

                        if (realType.options.type) {
                            let type = realType.options.type(),
                                typeType = typeof type;

                            if (typeType === 'string') {
                                realType.instance = (!isNaN(Date.parse(type))) ? 'Date' : 'String';
                            } else {
                                realType.instance = typeType;
                            }
                        }
                    }
                    outPath[element] = extend(true, {}, paths[element]);
                    if (paths[element].options.secure) {
                        hiddenFields.push(element);
                    }
                    if (paths[element].options.match) {
                        outPath[element].options.match = paths[element].options.match.source || paths[element].options.match;
                    }
                    let schemaListInfo: any = paths[element].options.list;
                    if (schemaListInfo) {
                        let listFieldInfo: ListField = {field: element};
                        if (typeof schemaListInfo === 'object' && Object.keys(schemaListInfo).length > 0) {
                            listFieldInfo.params = schemaListInfo;
                        }
                        listFields.push(listFieldInfo);
                    }
                }
            }
        }
        outPath = this.applySchemaSubset(outPath, formSchema);
        let returnObj: any = {paths: outPath};
        if (hiddenFields.length > 0) {
            returnObj.hide = hiddenFields;
        }
        if (listFields.length > 0) {
            returnObj.listFields = listFields;
        }
        return returnObj;
    };

    schema() {
        return _.bind(function (req, res) {
            if (!(req.resource = this.getResource(req.params.resourceName))) {
                return res.status(404).end();
            }
            let formSchema = null;
            if (req.params.formName) {
                formSchema = req.resource.model.schema.statics['form'](req.params.formName, req);
            }
            let paths = this.preprocess(req.resource, req.resource.model.schema.paths, formSchema).paths;
            res.send(paths);
        }, this);
    };

    report() {
        return _.bind(async function (req, res, next) {
            if (!(req.resource = this.getResource(req.params.resourceName))) {
                return next();
            }

            const self = this;
            if (typeof req.query === 'undefined') {
                req.query = {};
            }

            let reportSchema;

            if (req.params.reportName) {
                reportSchema = await req.resource.model.schema.statics['report'](req.params.reportName, req);
            } else if (req.query.r) {
                switch (req.query.r[0]) {
                    case '[':
                        reportSchema = {pipeline: JSON.parse(req.query.r)};
                        break;
                    case '{':
                        reportSchema = JSON.parse(req.query.r);
                        break;
                    default:
                        return self.renderError( new Error('Invalid "r" parameter'), null, req, res);
                }
            } else {
                let fields = {};
                for (let key in req.resource.model.schema.paths) {
                    if (req.resource.model.schema.paths.hasOwnProperty(key)) {
                        if (key !== '__v' && !req.resource.model.schema.paths[key].options.secure) {
                            if (key.indexOf('.') === -1) {
                                fields[key] = 1;
                            }
                        }
                    }
                }
                reportSchema = {
                    pipeline: [
                        {$project: fields}
                    ], drilldown: req.params.resourceName + '/|_id|/edit'
                };
            }

            // Replace parameters in pipeline
            let schemaCopy: any = {};
            extend(schemaCopy, reportSchema);
            schemaCopy.params = schemaCopy.params || [];

            self.reportInternal(req, req.resource, schemaCopy, function (err, result) {
                if (err) {
                    self.renderError(err, null, req, res);
                } else {
                    res.send(result);
                }
            });
        }, this);
    };

    hackVariablesInPipeline(runPipeline: Array<any>) {
        for (let pipelineSection = 0; pipelineSection < runPipeline.length; pipelineSection++) {
            if (runPipeline[pipelineSection]['$match']) {
                this.hackVariables(runPipeline[pipelineSection]['$match']);
            }
        }
    };

    hackVariables(obj) {
        // Replace variables that cannot be serialised / deserialised.  Bit of a hack, but needs must...
        // Anything formatted 1800-01-01T00:00:00.000Z or 1800-01-01T00:00:00.000+0000 is converted to a Date
        // Only handles the cases I need for now
        // TODO: handle arrays etc
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (typeof obj[prop] === 'string') {
                    const dateTest = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3})(Z|[+ -]\d{4})$/.exec(obj[prop]);
                    if (dateTest) {
                        obj[prop] = new Date(dateTest[1] + 'Z');
                    } else {
                        const objectIdTest = /^([0-9a-fA-F]{24})$/.exec(obj[prop]);
                        if (objectIdTest) {
                            obj[prop] = new this.mongoose.Types.ObjectId(objectIdTest[1]);
                        }
                    }
                } else if (_.isObject(obj[prop])) {
                    this.hackVariables(obj[prop]);
                }
            }
        }
    };

    sanitisePipeline(
        aggregationParam: any | any[],
        hiddenFields,
        findFuncQry: any): any[] {
        let that = this;
        let array = Array.isArray(aggregationParam) ? aggregationParam : [aggregationParam];
        let retVal = [];
        let doneHiddenFields = false;
        if (findFuncQry) {
            retVal.unshift({$match: findFuncQry});
        }
        for (let pipelineSection = 0; pipelineSection < array.length; pipelineSection++) {
            let stage = array[pipelineSection];
            let keys = Object.keys(stage);
            if (keys.length !== 1) {
                throw new Error('Invalid pipeline instruction');
            }
            switch (keys[0]) {
                case '$merge':
                case '$out':
                    throw new Error('Cannot use potentially destructive pipeline stages')
                case '$match':
                    this.hackVariables(array[pipelineSection]['$match']);
                    retVal.push(array[pipelineSection]);
                    if (!doneHiddenFields && Object.keys(hiddenFields) && Object.keys(hiddenFields).length > 0) {
                        // We can now project out the hidden fields (we wait for the $match to make sure we don't break
                        // a select that uses a hidden field
                        retVal.push({$project: hiddenFields});
                        doneHiddenFields = true;
                    }
                    stage = null;
                    break;
                case '$lookup':
                    // hide any hiddenfields in the lookup collection
                    const collectionName = stage.$lookup.from;
                    const lookupField = stage.$lookup.as;
                    if ((collectionName + lookupField).indexOf('$') !== -1) {
                        throw new Error('No support for lookups where the "from" or "as" is anything other than a simple string')
                    }
                    const resource = that.getResourceFromCollection(collectionName);
                    if (resource) {
                        if (resource.options?.hide?.length > 0) {
                            const hiddenLookupFields = this.generateHiddenFields(resource, false);
                            let hiddenFieldsObj: any = {}
                            Object.keys(hiddenLookupFields).forEach(hf => {
                                hiddenFieldsObj[`${lookupField}.${hf}`] = false;
                            })
                            retVal.push({$project: hiddenFieldsObj});
                        }
                    }
                    break;
                default:
                    // nothing
                    break;
            }
            if (stage) {
                retVal.push(stage);
            }
        }
        if (!doneHiddenFields && Object.keys(hiddenFields) && Object.keys(hiddenFields).length > 0) {
            // If there was no $match we still need to hide the hidden fields
            retVal.unshift({$project: hiddenFields});
        }
        return retVal;
    }


    reportInternal(req, resource, schema, callback) {
        let runPipelineStr: string;
        let runPipelineObj: any;
        let self = this;
        if (typeof req.query === 'undefined') {
            req.query = {};
        }

        self.doFindFunc(req, resource, function (err, queryObj) {
            if (err) {
                return 'There was a problem with the findFunc for model';
            } else {
                runPipelineStr = JSON.stringify(schema.pipeline);
                for (let param in req.query) {
                    if (req.query.hasOwnProperty(param)) {
                        if (req.query[param]) {
                            if (param !== 'r') {             // we don't want to copy the whole report schema (again!)
                                schema.params[param].value = req.query[param];
                            }
                        }
                    }
                }

                // Replace parameters with the value
                if (runPipelineStr) {
                    runPipelineStr = runPipelineStr.replace(/"\(.+?\)"/g, function (match) {
                        let sparam = schema.params[match.slice(2, -2)];
                        if (sparam.type === 'number') {
                            return sparam.value;
                        } else if (_.isObject(sparam.value)) {
                            return JSON.stringify(sparam.value);
                        } else if (sparam.value[0] === '{') {
                            return sparam.value;
                        } else {
                            return '"' + sparam.value + '"';
                        }
                    });
                }

                runPipelineObj = JSON.parse(runPipelineStr);
                let hiddenFields = self.generateHiddenFields(resource, false);

                let toDo: any = {
                    runAggregation: function (cb) {
                        runPipelineObj = self.sanitisePipeline(runPipelineObj, hiddenFields, queryObj);
                        resource.model.aggregate(runPipelineObj, cb);
                    }
                };

                let translations = [];  // array of form {ref:'lookupname',translations:[{value:xx, display:'  '}]}
                // if we need to do any column translations add the function to the tasks list
                if (schema.columnTranslations) {
                    toDo.applyTranslations = ['runAggregation', function (results: any, cb) {

                        function doATranslate(column, theTranslation) {
                            results['runAggregation'].forEach(function (resultRow) {
                                let valToTranslate = resultRow[column.field];
                                valToTranslate = (valToTranslate ? valToTranslate.toString() : '');
                                let thisTranslation = _.find(theTranslation.translations, function (option) {
                                    return valToTranslate === option.value.toString();
                                });
                                resultRow[column.field] = thisTranslation ? thisTranslation.display : ' * Missing columnTranslation * ';
                            });
                        }

                        schema.columnTranslations.forEach(function (columnTranslation) {
                            if (columnTranslation.translations) {
                                doATranslate(columnTranslation, columnTranslation);
                            }
                            if (columnTranslation.ref) {
                                let theTranslation = _.find(translations, function (translation) {
                                    return (translation.ref === columnTranslation.ref);
                                });
                                if (theTranslation) {
                                    doATranslate(columnTranslation, theTranslation);
                                } else {
                                    cb('Invalid ref property of ' + columnTranslation.ref + ' in columnTranslations ' + columnTranslation.field);
                                }
                            }
                        });
                        cb(null, null);
                    }];

                    let callFuncs = false;
                    for (let i = 0; i < schema.columnTranslations.length; i++) {
                        let thisColumnTranslation = schema.columnTranslations[i];

                        if (thisColumnTranslation.field) {
                            // if any of the column translations are adhoc funcs, set up the tasks to perform them
                            if (thisColumnTranslation.fn) {
                                callFuncs = true;
                            }

                            // if this column translation is a "ref", set up the tasks to look up the values and populate the translations
                            if (thisColumnTranslation.ref) {
                                let lookup = self.getResource(thisColumnTranslation.ref);
                                if (lookup) {
                                    if (!toDo[thisColumnTranslation.ref]) {
                                        let getFunc = function (ref) {
                                            let lookup = ref;
                                            return function (cb) {
                                                let translateObject = {ref: lookup.resourceName, translations: []};
                                                translations.push(translateObject);
                                                lookup.model.find({}, {}, {lean: true}, function (err, findResults) {
                                                    if (err) {
                                                        cb(err);
                                                    } else {
                                                        // TODO - this ref func can probably be done away with now that list fields can have ref
                                                        let j = 0;
                                                        async.whilst(
                                                            function (cbtest) {
                                                                cbtest(null, j < findResults.length);
                                                            },
                                                            function (cbres) {
                                                                let theResult = findResults[j];
                                                                translateObject.translations[j] = translateObject.translations[j] || {};
                                                                let theTranslation = translateObject.translations[j];
                                                                j++;
                                                                self.getListFields(lookup, theResult, function (err, description) {
                                                                    if (err) {
                                                                        cbres(err);
                                                                    } else {
                                                                        theTranslation.value = theResult._id;
                                                                        theTranslation.display = description;
                                                                        cbres(null);
                                                                    }
                                                                })
                                                            },
                                                            cb
                                                        );
                                                    }
                                                });
                                            };
                                        };
                                        toDo[thisColumnTranslation.ref] = getFunc(lookup);
                                        toDo.applyTranslations.unshift(thisColumnTranslation.ref);  // Make sure we populate lookup before doing translation
                                    }
                                } else {
                                    return callback('Invalid ref property of ' + thisColumnTranslation.ref + ' in columnTranslations ' + thisColumnTranslation.field);
                                }
                            }
                            if (!thisColumnTranslation.translations && !thisColumnTranslation.ref && !thisColumnTranslation.fn) {
                                return callback('A column translation needs a ref, fn or a translations property - ' + thisColumnTranslation.field + ' has neither');
                            }
                        } else {
                            return callback('A column translation needs a field property');
                        }
                    }
                    if (callFuncs) {
                        toDo['callFunctions'] = ['runAggregation', function (results, cb) {
                            async.each(results.runAggregation, function (row, cb) {
                                for (let i = 0; i < schema.columnTranslations.length; i++) {
                                    let thisColumnTranslation = schema.columnTranslations[i];

                                    if (thisColumnTranslation.fn) {
                                        thisColumnTranslation.fn(row, cb);
                                    }
                                }
                            }, function () {
                                cb(null);
                            });
                        }];
                        toDo.applyTranslations.unshift('callFunctions');  // Make sure we do function before translating its result
                    }
                }

                async.auto(toDo, function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        // TODO: Could loop through schema.params and just send back the values
                        callback(null, {
                            success: true,
                            schema: schema,
                            report: results.runAggregation,
                            paramsUsed: schema.params
                        });
                    }
                });
            }
        });
    };

    saveAndRespond(req, res, hiddenFields) {

        function internalSave(doc) {
            doc.save(function (err, doc2) {
                if (err) {
                    let err2: any = {status: 'err'};
                    if (!err.errors) {
                        err2.message = err.message;
                    } else {
                        extend(err2, err);
                    }
                    if (debug) {
                        console.log('Error saving record: ' + JSON.stringify(err2));
                    }
                    res.status(400).send(err2);
                } else {
                    doc2 = doc2.toObject();
                    for (const hiddenField in hiddenFields) {
                        if (hiddenFields.hasOwnProperty(hiddenField) && hiddenFields[hiddenField]) {
                            let parts = hiddenField.split('.');
                            let lastPart = parts.length - 1;
                            let target = doc2;
                            for (let i = 0; i < lastPart; i++) {
                                if (target.hasOwnProperty(parts[i])) {
                                    target = target[parts[i]];
                                }
                            }
                            if (target.hasOwnProperty(parts[lastPart])) {
                                delete target[parts[lastPart]];
                            }
                        }
                    }
                    res.send(doc2);
                }
            });
        }

        let doc = req.doc;
        if (typeof req.resource.options.onSave === 'function') {

            req.resource.options.onSave(doc, req, function (err) {
                if (err) {
                    throw err;
                }
                internalSave(doc);
            });
        } else {
            internalSave(doc);
        }
    };

    /**
     * All entities REST functions have to go through this first.
     */
    processCollection(req) {
        req.resource = this.getResource(req.params.resourceName);
    };

    /**
     * Renders a view with the list of docs, which may be modified by query parameters
     */
    collectionGet() {
        return _.bind(function (req, res, next) {
            this.processCollection(req);
            if (!req.resource) {
                return next();
            }
            if (typeof req.query === 'undefined') {
                req.query = {};
            }

            try {
                const aggregationParam = req.query.a ? JSON.parse(req.query.a) : null;
                const findParam = req.query.f ? JSON.parse(req.query.f) : {};
                const projectParam = req.query.p ? JSON.parse(req.query.p) : {};
                const limitParam = req.query.l ? JSON.parse(req.query.l) : 0;
                const skipParam = req.query.s ? JSON.parse(req.query.s) : 0;
                const orderParam = req.query.o ? JSON.parse(req.query.o) : req.resource.options.listOrder;

                // Dates in aggregation must be Dates
                if (aggregationParam) {
                    this.hackVariablesInPipeline(aggregationParam);
                }

                const self = this;
                this.filteredFind(req.resource, req, aggregationParam, findParam, projectParam, orderParam, limitParam, skipParam, function (err, docs) {
                    if (err) {
                        return self.renderError(err, null, req, res);
                    } else {
                        res.send(docs);
                    }
                });
            } catch (e) {
                res.send(e);
            }
        }, this);
    };

    generateProjection(hiddenFields, projectParam): any {

        let type;

        function setSelectType(typeChar, checkChar) {
            if (type === checkChar) {
                throw new Error('Cannot mix include and exclude fields in select');
            } else {
                type = typeChar;
            }
        }

        let retVal: any = hiddenFields;
        if (projectParam) {
            let projection = Object.keys(projectParam);
            if (projection.length > 0) {
                projection.forEach(p => {
                    if (projectParam[p] === 0) {
                        setSelectType('E', 'I');
                    } else if (projectParam[p] === 1) {
                        setSelectType('I', 'E');
                    } else {
                        throw new Error('Invalid projection: ' + projectParam);
                    }
                });
                if (type && type === 'E') {
                    // We are excluding fields - can just merge with hiddenFields
                    Object.assign(retVal, projectParam, hiddenFields);
                } else {
                    // We are selecting fields - make sure none are hidden
                    retVal = projectParam;
                    for (let h in hiddenFields) {
                        if (hiddenFields.hasOwnProperty(h)) {
                            delete retVal[h];
                        }
                    }
                }
            }
        }
        return retVal;
    };

    doFindFunc(req, resource, cb) {
        if (resource.options.findFunc) {
            resource.options.findFunc(req, cb);
        } else {
            cb(null);
        }
    };

    filteredFind(
        resource: Resource,
        req: Express.Request,
        aggregationParam: any,
        findParam: any,
        projectParam: any,
        sortOrder: any,
        limit: number | null,
        skip: number | null,
        callback: (err: Error, docs?: any[]) => void) {
        const that = this;
        let hiddenFields = this.generateHiddenFields(resource, false);
        let stashAggregationResults;

        function doAggregation(queryObj, cb) {
            if (aggregationParam) {
                aggregationParam = that.sanitisePipeline(aggregationParam, hiddenFields, queryObj);
                void resource.model.aggregate(aggregationParam, function (err, aggregationResults) {
                    if (err) {
                        throw err;
                    } else {
                        stashAggregationResults = aggregationResults;
                        cb(_.map(aggregationResults, function (obj) {
                            return obj._id;
                        }));
                    }
                });
            } else {
                cb([]);
            }
        }

        that.doFindFunc(req, resource, function (err, queryObj) {
            if (err) {
                callback(err);
            } else {
                doAggregation(queryObj, function (idArray) {
                    if (aggregationParam && idArray.length === 0) {
                        callback(null, []);
                    } else {
                        let query = resource.model.find(queryObj);
                        if (idArray.length > 0) {
                            query = query.where('_id').in(idArray);
                        }
                        if (findParam) {
                            query = query.find(findParam);
                        }
                        query = query.select(that.generateProjection(hiddenFields, projectParam));
                        if (limit) {
                            query = query.limit(limit);
                        }
                        if (skip) {
                            query = query.skip(skip);
                        }
                        if (sortOrder) {
                            query = query.sort(sortOrder);
                        }
                        query.exec(function (err, docs) {
                            if (!err && stashAggregationResults) {
                                docs.forEach(obj => {
                                    // Add any fields from the aggregation results whose field name starts __ to the mongoose Document
                                    let aggObj = stashAggregationResults.find(a => a._id.toString() === obj._id.toString());
                                    Object.keys(aggObj).forEach(k => {
                                        if (k.slice(0, 2) === '__') {
                                            obj[k] = aggObj[k];
                                        }
                                    });
                                })
                            }
                            callback(err, docs)
                        });
                    }
                });
            }
        });
    };

    collectionPost() {
        return _.bind(function (req, res, next) {
            this.processCollection(req);
            if (!req.resource) {
                next();
                return;
            }
            if (!req.body) {
                throw new Error('Nothing submitted.');
            }

            let cleansedBody = this.cleanseRequest(req);
            req.doc = new req.resource.model(cleansedBody);

            this.saveAndRespond(req, res);
        }, this);
    };

    /**
     * Generate an object of fields to not expose
     **/
    generateHiddenFields(resource: Resource, state: boolean): { [fieldName: string]: boolean } {
        let hiddenFields = {};

        if (resource.options['hide'] !== undefined) {
            resource.options.hide.forEach(function (dt) {
                hiddenFields[dt] = state;
            });
        }
        return hiddenFields;
    };

    /** Sec issue
     * Cleanse incoming data to avoid overwrite and POST request forgery
     * (name may seem weird but it was in French, so it is some small improvement!)
     */
    cleanseRequest(req) {
        let reqData = req.body,
            resource = req.resource;

        delete reqData.__v;   // Don't mess with Mongoose internal field (https://github.com/LearnBoost/mongoose/issues/1933)
        if (typeof resource.options['hide'] === 'undefined') {
            return reqData;
        }
        let hiddenFields = resource.options.hide;

        _.each(reqData, function (num, key) {
            _.each(hiddenFields, function (fi) {
                if (fi === key) {
                    delete reqData[key];
                }
            });
        });

        return reqData;
    };

    generateQueryForEntity(req, resource, id, cb) {
        let that = this;
        let hiddenFields = this.generateHiddenFields(resource, false);
        hiddenFields.__v = false;

        that.doFindFunc(req, resource, function (err, queryObj) {
            if (err) {
                cb(err);
            } else {
                const idSel = {_id: id};
                let crit;
                if (queryObj) {
                    if (queryObj._id) {
                        crit = {$and: [idSel, {_id: queryObj._id}]};
                        delete queryObj._id;
                        if (Object.keys(queryObj).length > 0) {
                            crit = extend(crit, queryObj);
                        }
                    } else {
                        crit = extend(queryObj, idSel);
                    }
                } else {
                    crit = idSel;
                }
                cb(null, resource.model.findOne(crit).select(that.generateProjection(hiddenFields, req.query?.p)));
            }
        });
    };

    /*
     * Entity request goes here first
     * It retrieves the resource
     */
    processEntity(req, res, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            next();
            return;
        }
        this.generateQueryForEntity(req, req.resource, req.params.id, function (err, query) {
            if (err) {
                return res.status(500).send({
                    success: false,
                    err: util.inspect(err)
                });
            } else {
                query.exec(function (err, doc) {
                    if (err) {
                        return res.status(400).send({
                            success: false,
                            err: util.inspect(err)
                        });
                    } else if (doc == null) {
                        return res.status(404).send({
                            success: false,
                            err: 'Record not found'
                        });
                    }
                    req.doc = doc;
                    next();
                });
            }
        });
    };

    /**
     * Gets a single entity
     *
     * @return {Function} The function to use as route
     */
    entityGet() {
        return _.bind(function (req, res, next) {

            this.processEntity(req, res, function () {
                if (!req.resource) {
                    return next();
                }
                if (req.resource.options.onAccess) {
                    req.resource.options.onAccess(req, function () {
                        return res.status(200).send(req.doc);
                    });
                } else {
                    return res.status(200).send(req.doc);
                }
            });
        }, this);
    };

    replaceHiddenFields(record, data) {
        const self = this;
        if (record) {
            record._replacingHiddenFields = true;
            _.each(data, function (value, name) {
                if (_.isObject(value) && !Array.isArray(value)) {
                    self.replaceHiddenFields(record[name], value);
                } else if (!record[name]) {
                    record[name] = value;
                }
            });
            delete record._replacingHiddenFields;
        }
    };

    entityPut() {
        return _.bind(function (req, res, next) {
            const that = this;

            this.processEntity(req, res, function () {
                if (!req.resource) {
                    next();
                    return;
                }

                if (!req.body) {
                    throw new Error('Nothing submitted.');
                }
                let cleansedBody = that.cleanseRequest(req);

                // Merge
                for (let prop in cleansedBody) {
                    if (cleansedBody.hasOwnProperty(prop)) {
                        req.doc.set(prop, cleansedBody[prop] === '' ? undefined : cleansedBody[prop])
                    }
                }

                if (req.resource.options.hide !== undefined) {
                    let hiddenFields = that.generateHiddenFields(req.resource, true);
                    hiddenFields._id = false;
                    req.resource.model.findById(req.doc._id, hiddenFields, {lean: true}, function (err, data) {
                        that.replaceHiddenFields(req.doc, data);
                        that.saveAndRespond(req, res, hiddenFields);
                    });
                } else {
                    that.saveAndRespond(req, res);
                }
            });
        }, this);
    };

    entityDelete() {
        let that = this;
        return _.bind(async function (req, res, next) {

            function generateDependencyList(resource: Resource) {
                if (resource.options.dependents === undefined) {
                    resource.options.dependents = that.resources.reduce(function (acc, r) {

                        function searchPaths(schema, prefix) {
                            var fldList = [];
                            for (var fld in schema.paths) {
                                if (schema.paths.hasOwnProperty(fld)) {
                                    var parts = fld.split('.');
                                    var schemaType = schema.tree;
                                    while (parts.length > 0) {
                                        schemaType = schemaType[parts.shift()];
                                    }
                                    if (schemaType.type) {
                                        if (schemaType.type.name === 'ObjectId' && schemaType.ref === resource.resourceName) {
                                            fldList.push(prefix + fld);
                                        } else if (_.isArray(schemaType.type)) {
                                            schemaType.type.forEach(function (t) {
                                                searchPaths(t, prefix + fld + '.');
                                            });
                                        }
                                    }
                                }
                            }
                            if (fldList.length > 0) {
                                acc.push({resource: r, keys: fldList});
                            }
                        }

                        if (r !== resource) {
                            searchPaths(r.model.schema, '');
                        }
                        return acc;
                    }, []);
                }
            }

            async function removeDoc(doc: Document, resource: Resource): Promise<any> {
                switch (resource.options.handleRemove) {
                    case 'allow':
                        // old behaviour - no attempt to maintain data integrity
                        return doc.remove();
                    case 'cascade':
                        generateDependencyList(resource);
                        res.status(400).send('"cascade" option not yet supported')
                        break;
                    default:
                        generateDependencyList(resource);
                        let promises = [];
                        resource.options.dependents.forEach(collection => {
                            collection.keys.forEach(key => {
                                promises.push({
                                    p: collection.resource.model.find({[key]: doc._id}).limit(1).exec(),
                                    collection,
                                    key
                                });
                            })
                        })
                        return Promise.all(promises.map(p => p.p))
                            .then((results) => {
                                results.forEach((r, i) => {
                                    if (r.length > 0) {
                                        throw new ForeignKeyError(resource.resourceName, promises[i].collection.resource.resourceName, promises[i].key, r[0]._id);
                                    }
                                })
                                return doc.remove();
                            })
                }
            }

            async function runDeletion(doc: Document, resource: Resource): Promise<any> {
                return new Promise((resolve) => {
                    if (resource.options.onRemove) {
                        resource.options.onRemove(doc, req, async function (err) {
                            if (err) {
                                throw err;
                            }
                            resolve(removeDoc(doc, resource));
                        });
                    } else {
                        resolve(removeDoc(doc, resource));
                    }
                })
            }

            this.processEntity(req, res, async function () {
                if (!req.resource) {
                    next();
                    return;
                }

                let doc = req.doc;
                try {
                    void await runDeletion(doc, req.resource)
                    res.status(200).send();
                } catch (e) {
                    if (e instanceof ForeignKeyError) {
                        res.status(400).send(e.message);
                    } else {
                        res.status(500).send(e.message);
                    }
                }
            });
        }, this);
    };

    entityList() {
        return _.bind(function (req, res, next) {
            const that = this;
            this.processEntity(req, res, function () {
                if (!req.resource) {
                    return next();
                }
                that.getListFields(req.resource, req.doc, function (err, display) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        return res.send({list: display});
                    }
                })
            });
        }, this);
    };

    extractTimestampFromMongoID(record: any): Date {
        let timestamp = record.toString().substring(0, 8);
        return new Date(parseInt(timestamp, 16) * 1000);
    }

}

class ForeignKeyError extends global.Error {
    constructor(resourceName, foreignKeyOnResource, foreignItem, id) {
        super(`Cannot delete this ${resourceName}, as it is the ${foreignItem} on ${foreignKeyOnResource} ${id}`);
        this.name = "ForeignKeyError";
        this.stack = (<any>new global.Error('')).stack;
    }
}
