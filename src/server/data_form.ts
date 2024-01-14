import {Document, FilterQuery, Mongoose, Types} from "mongoose";
import {Express} from "express";
import {fngServer} from "./index";
import Resource = fngServer.Resource;
import ResourceOptions = fngServer.ResourceOptions;
import ListField = fngServer.ListField;
import FngOptions = fngServer.FngOptions;
import IFngPlugin = fngServer.IFngPlugin;
import IInternalSearchResult = fngServer.IInternalSearchResult;
import ISearchResultFormatter = fngServer.ISearchResultFormatter;
import Path = fngServer.Path;
import ForeignKeyList = fngServer.ForeignKeyList;

// This part of forms-angular borrows from https://github.com/Alexandre-Strzelewicz/angular-bridge
// (now https://github.com/Unitech/angular-bridge

const _ = require('lodash');
const util = require('util');
const extend = require('node.extend');
const async = require('async');

let debug = false;

type IHiddenFields = { [fieldName: string]: boolean };

function logTheAPICalls(req: Express.Request, res: Express.Response, next) {
    void (res);
    console.log('API     : ' + req.method + ' ' + req.url + '  [ ' + JSON.stringify(req.body) + ' ]');
    next();
}

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
        return entityMap[s];
    });
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

        // Do the plugin routes first
        for (let pluginName in this.options.plugins) {
            if (this.options.plugins.hasOwnProperty(pluginName)) {
                let pluginObj: IFngPlugin = this.options.plugins[pluginName];
                this.options.plugins[pluginName] = Object.assign(this.options.plugins[pluginName], pluginObj.plugin(this, processArgs, pluginObj.options));
            }
        }

        const search = 'search/', schema = 'schema/', report = 'report/', resourceName = ':resourceName', id = '/:id', formName = '/:formName', newClarifier = '/new';
        this.app.get.apply(this.app, processArgs(this.options, ['models', this.models()]));

        this.app.get.apply(this.app, processArgs(this.options, [search + resourceName, this.search()]));

        this.app.get.apply(this.app, processArgs(this.options, [schema + resourceName, this.schema()]));
        this.app.get.apply(this.app, processArgs(this.options, [schema + resourceName + formName, this.schema()]));

        this.app.get.apply(this.app, processArgs(this.options, [report + resourceName, this.report()]));
        this.app.get.apply(this.app, processArgs(this.options, [report + resourceName + '/:reportName', this.report()]));

        this.app.get.apply(this.app, processArgs(this.options, [resourceName, this.collectionGet()]));

        // return the List attributes for all records - used by record-handler's setUpLookupOptions() method, for cases
        // where there's a lookup that doesn't use the fngajax option 
        this.app.get.apply(this.app, processArgs(this.options, [resourceName + '/listAll', this.entityListAll()]));

        // return the List attributes for a record - used by fng-ui-select
        this.app.get.apply(this.app, processArgs(this.options, [resourceName + id + '/list', this.entityList()]));

        // 2x get, with and without formName
        this.app.get.apply(this.app, processArgs(this.options, [resourceName + id, this.entityGet()]));
        this.app.get.apply(this.app, processArgs(this.options, [resourceName + formName + id, this.entityGet()])); // We don't use the form name, but it can optionally be included so it can be referenced by the permissions check

        // 3x post (for creating a new record), with and without formName, and in the case of without, with or without /new (which isn't needed if there's no formName)
        this.app.post.apply(this.app, processArgs(this.options, [resourceName, this.collectionPost()]));
        this.app.post.apply(this.app, processArgs(this.options, [resourceName + newClarifier, this.collectionPost()]));
        this.app.post.apply(this.app, processArgs(this.options, [resourceName + formName + newClarifier, this.collectionPost()]));

        // 2x post and 2x put (for saving modifications to existing record), with and without formName
        // (You can POST or PUT to update data)
        this.app.post.apply(this.app, processArgs(this.options, [resourceName + id, this.entityPut()])); 
        this.app.post.apply(this.app, processArgs(this.options, [resourceName + formName + id, this.entityPut()]));
        this.app.put.apply(this.app, processArgs(this.options, [resourceName + id, this.entityPut()]));
        this.app.put.apply(this.app, processArgs(this.options, [resourceName + formName + id, this.entityPut()]));

        // 2x delete, with and without formName
        this.app.delete.apply(this.app, processArgs(this.options, [resourceName + id, this.entityDelete()]));
        this.app.delete.apply(this.app, processArgs(this.options, [resourceName + formName + id, this.entityDelete()]));

        this.app.get.apply(this.app, processArgs(this.options, ['search', this.searchAll()]));
    }

    getFirstMatchingField(resource: Resource, doc: Document, keyList: string[], type?: string) {
        for (let i = 0; i < keyList.length; i++) {
            let fieldDetails = resource.model.schema['tree'][keyList[i]];
            if (fieldDetails.type && (!type || fieldDetails.type.name === type) && keyList[i] !== '_id') {
                resource.options.listFields = [{field: keyList[i]}];
                return doc ? doc[keyList[i]] : keyList[i];
            }
        }
    }

    getListFields(resource: Resource, doc: Document, cb) {
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
                                    lookupResource.model
                                        .findOne({_id: doc[aField.field]})
                                        .select(hiddenFields)
                                        .exec()
                                        .then((doc2) => {
                                            that.getListFields(lookupResource, doc2, cbm);
                                        })
                                        .catch((err) => {
                                            cbm(err);
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
            display = this.getFirstMatchingField(resource, doc, keyList, 'String') ||
                // and if there aren't any then just take the first field
                this.getFirstMatchingField(resource, doc, keyList);
            cb(null, display.trim());
        }
    };

    // generate a Mongo projection that can be used to restrict a query to return only those fields from the given
    // resource that are identified as "list" fields (i.e., ones that should appear whenever records of that type are
    // displayed in a list)
    generateListFieldProjection(resource: Resource) {
        const projection = {};
        const listFields = resource.options?.listFields;
        // resource.options.listFields will identify all of the fields from resource that have a value for .list.
        // generally, that value will be "true", identifying the corresponding field as one which should be
        // included whenever records of that type appear in a list.
        // occasionally, it will instead be "{ ref: true }"", which means something entirely different -
        // this means that the field requires a lookup translation before it can be displayed on a form.
        // for our purposes, we're interested in only the first of these two cases, so we'll ignore anything where
        // field.params.ref has a truthy value
        if (listFields) {
            for (const field of listFields) {
                if (!field.params?.ref) {
                    projection[field.field] = 1;
                }
            }
        } else {
            const keyList = Object.keys(resource.model.schema['tree']);
            const firstField = (
                // No list field specified - use the first String field,
                this.getFirstMatchingField(resource, undefined, keyList, 'String') ||
                // and if there aren't any then just take the first field
                this.getFirstMatchingField(resource, undefined, keyList)
            );
            projection[firstField] = 1;
        }
        return projection;
    };

    newResource(model, options: ResourceOptions) {
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
    addResource(resourceName: string, model, options: ResourceOptions) {
        let resource: Resource = {
            resourceName: resourceName,
            resourceNameLower: resourceName.toLowerCase(),
            options: options || {}
        };
        if (!resource.options.suppressDeprecatedMessage) {
            console.log('addResource is deprecated - see https://github.com/forms-angular/forms-angular/issues/39');
        }
        // Check all the synonyms are lower case
        resource.options.synonyms?.forEach(s => { s.name = s.name.toLowerCase()});

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

        extend(resource.options, this.preprocess(resource, resource.model.schema['paths']));

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
            return resource.resourceName === name || resource.options.resourceName === name;
        });
    };

    getResourceFromCollection(name: string): Resource {
        return _.find(this.resources, function (resource) {
            return resource.model.collection.collectionName === name;
        });
    };
    
    // Using the given (already-populated) AmbiguousRecordStore, generate text suitable for
    // disambiguation of each ambiguous record, and pass that to the given disambiguateItemCallback
    // so our caller can decorate the ambiguous record in whatever way it deems appropriate.
    //
    // The ambiguousRecordStore provided to this function (generated either by a call to
    // buildSingleResourceAmbiguousRecordStore() or buildMultiResourceAmbiguousRecordStore()) will
    // already be grouping records by the resource that should be used to disambiguate them, with
    // the name of that resource being the primary index property of the store.
    //
    // The disambiguation text will be the concatenation (space-seperated) of the list fields for
    // the doc from that resource whose _id matches the value of record[disambiguationField].
    //
    // allRecords should include all of the ambiguous records (also held by AmbiguousRecordStore)
    // as well as those found not to be ambiguous.  The final act of this function will be to delete
    // the disambiguation field from those records - it is only going to be there for the purpose
    // of disambiguation, and should not be returned by our caller once disambiguation is complete.
    //
    // The scary-looking templating used here ensures that the objects in allRecords (and also
    // ambiguousRecordStore) include an (optional) string property with the name identified by
    // disambiguationField.  For the avoidance of doubt, "prop" here could be anything - "foo in f"
    // would achieve the same result.
    disambiguate<t extends { [prop in f]?: string }, f extends string>(
        allRecords: t[],
        ambiguousRecordStore: fngServer.AmbiguousRecordStore<t>,
        disambiguationField: f,
        disambiguateItemCallback: (item: t, disambiguationText: string) => void,
        completionCallback: (err) => void
    ): void {
        const that = this;
        async.map(
            Object.keys(ambiguousRecordStore),
            function (resourceName: string, cbm: (err) => void) {
                const resource = that.getResource(resourceName);
                const projection = that.generateListFieldProjection(resource);
                resource.model
                    .find({_id: { $in: ambiguousRecordStore[resourceName].map((sr) => sr[disambiguationField]) }})
                    .select(projection)
                    .lean()
                    .then((disambiguationRecs: any[]) => {
                        for (const ambiguousResult of ambiguousRecordStore[resourceName]) {
                            const disambiguator = disambiguationRecs.find((d) => d._id.toString() === ambiguousResult[disambiguationField].toString());
                            if (disambiguator) {
                                let suffix = "";
                                for (const listField in projection) {
                                    if (disambiguator[listField]) {
                                        if (suffix) {
                                            suffix += " ";
                                        }
                                        suffix += disambiguator[listField];
                                    }                                                
                                }
                                if (suffix) {
                                    disambiguateItemCallback(ambiguousResult, suffix);
                                }                                            
                            }
                        }
                        cbm(null);
                    })
                    .catch((err) => {
                        cbm(err);
                    })
            },
            (err) => {
                for (const record of allRecords) {
                    delete record[disambiguationField];
                }
                completionCallback(err);
            }            
        );
    }

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
        let collectionNameLower: string;
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
                collectionNameLower = collectionName.toLowerCase();
                searchFor = searchFor.slice(colonPos + 1, 999).trim();
                if (searchFor === '') {
                    searchFor = '?';
                }
                break;
        }
        for (let i = 0; i < resourceCount; i++) {
            let resource = resourcesToSearch[i];
            if (resourceCount === 1 || (resource.options.searchImportance !== false && (!collectionName || collectionNameLower === resource.resourceNameLower || resource.options?.synonyms?.find(s => s.name === collectionNameLower)))) {
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

                let synonymObj = resource.options?.synonyms?.find(s => s.name.toLowerCase() === collectionNameLower);
                const synonymFilter = synonymObj?.filter;
                for (let m = 0; m < indexedFields.length; m++) {
                    let searchObj: {resource: Resource, field: string, filter?: any} = {resource: resource, field: indexedFields[m]}
                    if (synonymFilter) {
                        searchObj.filter = synonymFilter;
                    }
                    searches.push(searchObj);
                }
            }
        }
        const that = this;
        let results: IInternalSearchResult[] = [];
        let moreCount = 0;
        let searchCriteria;
        let searchStrings;
        let multiMatchPossible = false;
        if (searchFor === '?') {
            // interpret this as a wildcard (so there is no way to search for ?
            searchCriteria = null;
        } else {
            // Support for searching anywhere in a field by starting with *
            let startAnchor = '^';
            if (searchFor.slice(0,1) === '*') {
                startAnchor = '';
                searchFor = searchFor.slice(1)
            }

            // THe snippet to escape the special characters comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            searchFor = searchFor.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
            multiMatchPossible = searchFor.includes(' ');
            if (multiMatchPossible) {
                searchStrings = searchFor.split(' ');
            }
            let modifiedSearchStr = multiMatchPossible ? searchStrings.join('|') : searchFor;
            searchFor = searchFor.toLowerCase();   // For later case-insensitive comparison

            // Removed the logic that preserved spaces when collection was specified because Louise asked me to.
            searchCriteria = {$regex: `${startAnchor}(${modifiedSearchStr})`, $options: 'i'};
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
                    let addHits: number;
                    if (multiMatchPossible) {
                        // If they match the whole search phrase in one index they get smaller addHits (so they sort higher)
                        if (aDoc[item.field].toLowerCase().indexOf(searchFor) === 0) {
                            addHits = 7;
                        }
                    }
                    let disambiguationId: any;
                    const opts = item.resource.options as fngServer.ResourceOptions;
                    const disambiguationResource = opts.disambiguation?.resource;
                    if (disambiguationResource) {
                        disambiguationId = aDoc[opts.disambiguation.field]?.toString();
                    }

                    // Use special listings format if defined
                    let specialListingFormat: ISearchResultFormatter = item.resource.options.searchResultFormat;
                    if (specialListingFormat) {
                        specialListingFormat.apply(aDoc, [req])
                            .then((resultObj) => {
                                resultObject = resultObj;
                                resultObject.addHits = addHits;
                                resultObject.disambiguationResource = disambiguationResource;
                                resultObject.disambiguationId = disambiguationId;
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
                                    disambiguationResource,
                                    disambiguationId,
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
                let searchFilter = filter || item.filter;
                if (searchFilter) {
                    that.hackVariables(searchFilter);
                    extend(searchDoc, searchFilter);
                    if (searchFilter[item.field]) {
                        delete searchDoc[item.field];
                        let obj1 = {}, obj2 = {};
                        obj1[item.field] = searchFilter[item.field];
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
                    that.disambiguate(
                        results,
                        that.buildMultiResourceAmbiguousRecordStore(results, ["text"], "disambiguationResource"),
                        "disambiguationId",
                        (item: IInternalSearchResult, disambiguationText: string) => {
                            item.text += ` (${disambiguationText})`;
                        },
                        (err) => {
                            if (err) {
                                callback(err);
                            } else {
                                // the disambiguate() call will have deleted the disambiguationIds but we're responsible for
                                // the disambiguationResources, which we shouldn't be returning to the client
                                for (const result of results) {
                                    delete result.disambiguationResource;
                                }
                                timestamps.completedAt = new Date().valueOf();
                                callback(null, {results, moreCount, timestamps});
                            }
                        }
                    );
                }
            }
        );
    };

    wrapInternalSearch(req: Express.Request, res: Express.Response, resourcesToSearch, includeResourceInResults, limit) {
        this.internalSearch(req, resourcesToSearch, includeResourceInResults, limit, function (err, resultsObject) {
            if (err) {
                res.status(400, err)
            } else {
                res.send(resultsObject);
            }
        });
    };

    search() {
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
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
            // Check for optional modelFilter and call it with the request and current list.  Otherwise just return the list.
            let resources = that.options.modelFilter ? that.options.modelFilter.call(null, req, that.resources) : that.resources;
            if (req.query?.resourceNamesOnly) {
                resources = resources.map((r) => r.resourceName);
            }
            res.send(resources);
        };
    };

    renderError(err, redirectUrl, req, res) {
        res.statusMessage = err?.message || err;
        res.status(400).end(err?.message || err);
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

    preprocess(resource: Resource, paths, formName?: string, formSchema?: any) {

        function processInternalObject(obj: any) {
            return Object.keys(obj).reduce((acc, cur, ) => {
                const curType= typeof obj[cur];
                if (!['$','_'].includes(cur.charAt(0)) && curType !== 'function') {
                    const val = obj[cur];
                    if (val) {
                        if (Array.isArray(val)) {
                            if (val.length > 0) {
                                acc[cur] = val;
                            }
                        } else if (curType === 'object' && !(val instanceof Date) && !(val instanceof RegExp)) {
                            acc[cur] = processInternalObject(obj[cur]);
                        } else {
                            acc[cur] = obj[cur];
                        }
                    }
                }
                return acc;
            }, {});
        }

        let outPath: Path = {},
            hiddenFields = [],
            listFields = [];

        if (resource && resource.preprocessed && resource.preprocessed[formName || "__default"]) {
            return resource.preprocessed[formName || "__default"].paths;
        } else {
            if (resource && resource.options && resource.options.idIsList) {
                paths['_id'].options = paths['_id'].options || {};
                paths['_id'].options.list = resource.options.idIsList;
            }
            for (let element in paths) {
                if (paths.hasOwnProperty(element) && element !== '__v') {
                    // check for schemas
                    if (paths[element].schema) {
                        let subSchemaInfo = this.preprocess(null, paths[element].schema.paths);
                        outPath[element] = { schema: subSchemaInfo.paths };
                        if (paths[element].options.form) {
                            outPath[element].options = { form: extend(true, {}, paths[element].options.form) };
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
                        outPath[element] = processInternalObject(paths[element]);
                        if (paths[element].options.secure) {
                            hiddenFields.push(element);
                        }
                        if (paths[element].options.match) {
                            outPath[element].options.match = paths[element].options.match.source || paths[element].options.match;
                        }
                        let schemaListInfo: any = paths[element].options.list;
                        if (schemaListInfo) {
                            let listFieldInfo: ListField = { field: element };
                            if (typeof schemaListInfo === 'object' && Object.keys(schemaListInfo).length > 0) {
                                listFieldInfo.params = schemaListInfo;
                            }
                            listFields.push(listFieldInfo);
                        }
                    }
                }
            }
            outPath = this.applySchemaSubset(outPath, formSchema);
            let returnObj: any = { paths: outPath };
            if (hiddenFields.length > 0) {
                returnObj.hide = hiddenFields;
            }
            if (listFields.length > 0) {
                returnObj.listFields = listFields;
            }
            if (resource) {
                resource.preprocessed = resource.preprocessed || {};
                resource.preprocessed[formName || "__default"] = returnObj;
            }
            return returnObj;
        }
    };

    schema() {
        return _.bind(function (req, res) {
            if (!(req.resource = this.getResource(req.params.resourceName))) {
                return res.status(404).end();
            }
            let formSchema = null;
            const formName = req.params.formName;
            if (req.resource.preprocessed?.[formName || "__default"]) {
                res.send(req.resource.preprocessed[formName || "__default"].paths);
            } else {
                if (formName) {
                    try {
                        formSchema = req.resource.model.schema.statics['form'](escapeHtml(formName), req);
                    } catch (e) {
                        return res.status(404).send(e.message);
                    }
                }
                let paths = this.preprocess(req.resource, req.resource.model.schema.paths, formName, formSchema).paths;
                res.send(paths);
            }
        }, this);
    };

    report() {
        return _.bind(async function (req: Express.Request, res: Express.Response, next) {
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
                    res.send({success:false, error: err.message || err});
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
                    } else if (prop !== "$regex") {
                        const objectIdTest = /^([0-9a-fA-F]{24})$/.exec(obj[prop]);
                        if (objectIdTest) {
                            obj[prop] = new Types.ObjectId(objectIdTest[1]);
                        }
                    }
                } else if (_.isObject(obj[prop])) {
                    this.hackVariables(obj[prop]);
                }
            }
        }
    };

    async sanitisePipeline(
        aggregationParam: any | any[],
        hiddenFields,
        findFuncQry: any,
        req? : any): Promise<any[]> {
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
                case '$project':
                case '$addFields':
                case '$count':
                case "$group":
                case "$limit":
                case "$replaceRoot":
                case "$sort":
                case "$unwind":
                    // We don't care about these - they are all (as far as we know) safe
                break;
                case '$unionWith':
                  /*
                    Sanitise the pipeline we are doing a union with, removing hidden fields from that collection
                 */
                  if (!stage.$unionWith.coll) {
                    stage.$unionWith = {coll: stage.$unionWith, pipeline: []};
                  }
                  const unionCollectionName = stage.$unionWith.coll;
                    const unionResource = that.getResourceFromCollection(unionCollectionName);
                    let unionHiddenLookupFields = {};
                    if (unionResource) {
                        if (unionResource.options?.hide?.length > 0) {
                            unionHiddenLookupFields = this.generateHiddenFields(unionResource, false);
                        }
                    }
                    stage.$unionWith.pipeline = await that.sanitisePipeline(stage.$unionWith.pipeline, unionHiddenLookupFields, findFuncQry, req);
                    break;
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
                case '$graphLookup':
                    if (keys[0] === '$lookup') {
                        // For now at least, we only support simple $lookups with a single join field equality
                        let lookupProps = Object.keys(stage.$lookup);
                        if (lookupProps.length !== 4 || lookupProps.indexOf('from') === -1 || lookupProps.indexOf('localField') === -1 || lookupProps.indexOf('foreignField') === -1 || lookupProps.indexOf('as') === -1) {
                            throw new Error("No support for $lookup that isn't Equality Match with a Single Join Condition");
                        }
                    }
                    // hide any hiddenfields in the lookup collection
                    const collectionName = stage[keys[0]].from;
                    const lookupField = stage[keys[0]].as;
                    if ((collectionName + lookupField).indexOf('$') !== -1) {
                        throw new Error('No support for lookups where the "from" or "as" is anything other than a simple string');
                    }
                    const resource = that.getResourceFromCollection(collectionName);
                    if (resource) {
                        retVal.push(stage);
                        stage = null;
                        if (resource.options?.hide?.length > 0) {
                            const hiddenLookupFields = this.generateHiddenFields(resource, false);
                            let hiddenFieldsObj = {};
                            Object.keys(hiddenLookupFields).forEach(hf => {
                                hiddenFieldsObj[`${lookupField}.${hf}`] = false;
                            });
                            retVal.push({ $project: hiddenFieldsObj });
                        }
                        // Now we need to make sure that we restrict the lookup to documents we have access to
                        if (resource.options.findFunc) {
                            let allowNulls = false;
                            // If the next stage is an $unwind
                            let nextStageIsUnwind = false;
                            if (array.length >= pipelineSection) {
                                const nextStage = array[pipelineSection + 1];
                                let nextKeys = Object.keys(nextStage);
                                if (nextKeys.length !== 1) {
                                    throw new Error('Invalid pipeline instruction');
                                }
                                if (nextKeys[0] === '$unwind') {
                                    if (nextStage["$unwind"] === "$" + lookupField) {
                                        nextStageIsUnwind = true;
                                    }
                                    if (nextStage["$unwind"] && nextStage["$unwind"].path === "$" + lookupField) {
                                        nextStageIsUnwind = true;
                                        if (nextStage["$unwind"].preserveNullAndEmptyArrays) {
                                            allowNulls = true;
                                        }
                                    }
                                }
                            }
                            if (!nextStageIsUnwind) {
                                throw new Error('No support for $lookup where the next stage is not an $unwind and the resources has a findFunc');
                            }
                            // Push the $unwind, add our own findFunc, and increment the pipelineStage counter
                            retVal.push(array[pipelineSection + 1]);
                            let lookedUpFindQry: FilterQuery<any> = await this.doFindFuncPromise(req, resource);
                            // Now we need to put the lookup base into the criteria
                            for (const prop in lookedUpFindQry) {
                                if (lookedUpFindQry.hasOwnProperty(prop)) {
                                    lookedUpFindQry[`${lookupField}.${prop}`] = lookedUpFindQry[prop];
                                    delete lookedUpFindQry[prop];
                                }
                            }
                            if (allowNulls) {
                                lookedUpFindQry = {$or: [lookedUpFindQry, {[lookupField]: {$exists: false}}]};
                            }
                            retVal.push({ $match: lookedUpFindQry });
                            pipelineSection++;
                        }
                    }
                    break;
                default:
                    // anything else is either known to be dangerous, not yet needed or we don't know what it is
                    throw new Error('Unsupported pipeline instruction ' + keys[0])
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
                    if (param !== 'noinput' && req.query.hasOwnProperty(param)) {
                        if (req.query[param]) {
                            if (param !== 'r') {             // we don't want to copy the whole report schema (again!)
                                if (schema.params[param] !== undefined) {
                                    schema.params[param].value = req.query[param];
                                } else {
                                    return callback(`No such parameter as ${param} - try one of ${Object.keys(schema.params).join()}`)
                                }
                            }
                        }
                    }
                }

                // Replace parameters with the value
                if (runPipelineStr) {
                    runPipelineStr = runPipelineStr.replace(/"\(.+?\)"/g, function (match) {
                        let sparam = schema.params[match.slice(2, -2)];
                        if (sparam !== undefined) {
                            if (sparam.type === 'number') {
                                return sparam.value;
                            } else if (_.isObject(sparam.value)) {
                                return JSON.stringify(sparam.value);
                            } else if (sparam.value[0] === '{') {
                                return sparam.value;
                            } else {
                                return '"' + sparam.value + '"';
                            }
                        } else {
                            return callback(`No such parameter as ${match.slice(2, -2)} - try one of ${Object.keys(schema.params).join()}`)
                        }
                    });
                }

                runPipelineObj = JSON.parse(runPipelineStr);
                let hiddenFields = self.generateHiddenFields(resource, false);

                let toDo: any = {
                    runAggregation: function (cb) {
                        self.sanitisePipeline(runPipelineObj, hiddenFields, queryObj, req)
                          .then((runPipelineObj) => {
                              resource.model.aggregate(runPipelineObj)
                                .then((results) => {
                                    cb(null, results);
                                })
                                .catch((err) => {
                                    cb(err);
                                })
                          })
                          .catch((err) => {
                              throw new Error('Error in sanitisePipeline ' + err)
                          });
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
                                                lookup.model.find({}, {})
                                                    .lean()
                                                    .exec()
                                                    .then((findResults) => {
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
                                                    })
                                                    .catch((err) => {
                                                        cb(err);
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

    saveAndRespond(req: Express.Request, res: Express.Response, hiddenFields? : IHiddenFields) {

        function internalSave(doc) {
            doc.save()
                .then((saved) => {
                    saved = saved.toObject();
                    for (const hiddenField in hiddenFields) {
                        if (hiddenFields.hasOwnProperty(hiddenField) && hiddenFields[hiddenField]) {
                            let parts = hiddenField.split('.');
                            let lastPart = parts.length - 1;
                            let target = saved;
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
                    res.send(saved);
                })
                .catch((err) => {
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
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
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
                res.status(400).send(e.message);
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

    async doFindFuncPromise(req: Express.Request, resource: Resource): Promise<FilterQuery<any>> {
        return new Promise((resolve, reject) => {
            this.doFindFunc(req, resource, (err, queryObj) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(queryObj);
                }
            });
        })
    };

    async filteredFind(
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

        async function doAggregation(queryObj, cb) {
            if (aggregationParam) {
                aggregationParam = await that.sanitisePipeline(aggregationParam, hiddenFields, queryObj, req);
                resource.model.aggregate(aggregationParam)
                    .then((aggregationResults) => {
                        stashAggregationResults = aggregationResults;
                        cb(_.map(aggregationResults, function (obj) {
                            return obj._id;
                        }));
                    }).catch((err) => {
                        throw err;
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
                        query.exec()
                            .then((docs) => {
                                if (stashAggregationResults) {
                                    for (const obj of docs) {
                                        // Add any fields from the aggregation results whose field name starts __ to the mongoose Document
                                        let aggObj = stashAggregationResults.find(a => a._id.toString() === obj._id.toString());
                                        for (const k of Object.keys(aggObj).filter((k) => k.startsWith('__'))) {
                                            obj[k] = aggObj[k];
                                        }
                                    }
                                }
                                callback(null, docs);
                            })
                            .catch((err) => {
                                callback(err);
                            });
                    }
                });
            }
        });
    };

    collectionPost() {
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
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
    generateHiddenFields(resource: Resource, state: boolean): IHiddenFields {
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
    processEntity(req: Express.Request, res: Express.Response, next) {
        if (!(req.resource = this.getResource(req.params.resourceName))) {
            return next();
        }
        this.generateQueryForEntity(req, req.resource, req.params.id, function (err, query) {
            if (err) {
                return res.status(500).send({
                    success: false,
                    err: util.inspect(err)
                });
            } else {
                query.exec()
                    .then((doc) => {
                        if (doc) {
                            req.doc = doc;
                            return next();
                        } else {
                            return res.status(404).send({
                                success: false,
                                err: 'Record not found'
                            });
                        }                        
                    })
                    .catch((err) => {
                        return res.status(400).send({
                            success: false,
                            err: util.inspect(err)
                        });
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
        return _.bind(function (req: Express.Request, res: Express.Response, next) {

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
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
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
                    req.resource.model.findById(req.doc._id, hiddenFields)
                        .lean()
                        .exec()
                        .then((data) => {
                            that.replaceHiddenFields(req.doc, data);
                            that.saveAndRespond(req, res, hiddenFields);
                        })
                        .catch((err) => {
                            throw err; // not sure if this is the right thing to do - didn't have any error-handing here in earlier version
                        });
                } else {
                    that.saveAndRespond(req, res);
                }
            });
        }, this);
    };

    generateDependencyList(resource: Resource){
        if (resource.options.dependents === undefined) {
            let that = this;
            resource.options.dependents = that.resources.reduce(function (acc, r) {

                        function searchPaths(schema, prefix) {
                            let fldList = [];
                            for (let fld in schema.paths) {
                                if (schema.paths.hasOwnProperty(fld)) {
                                    const parts = fld.split('.');
                                    let schemaType = schema.tree;
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
                        searchPaths(r.model.schema, '');
                        return acc;
                    }, []);
                    for (let pluginName in that.options.plugins) {
                        let thisPlugin: IFngPlugin = that.options.plugins[pluginName];
                        if (thisPlugin.dependencyChecks && thisPlugin.dependencyChecks[resource.resourceName]) {
                            resource.options.dependents = resource.options.dependents.concat(thisPlugin.dependencyChecks[resource.resourceName])
                        }
                    }
                }
            }

    async getDependencies(resource: Resource, id: Types.ObjectId) : Promise<ForeignKeyList> {
        this.generateDependencyList(resource);
        let promises = [];
        let foreignKeyList: ForeignKeyList = [];
        resource.options.dependents.forEach(collection => {
            collection.keys.forEach(key => {
                promises.push({
                    p: collection.resource.model.find({[key]: id}).limit(1).exec(),
                    collection,
                    key
                });
            })
        })
        return Promise.all(promises.map(p => p.p))
          .then((results) => {
              results.forEach((r, i) => {
                  if (r.length > 0) {
                      foreignKeyList.push({ resourceName: promises[i].collection.resource.resourceName, key: promises[i].key, id: r[0]._id});
                  }
              })
              return foreignKeyList;
          })
    }

    entityDelete() {
        let that = this;
        return _.bind(async function (req: Express.Request, res: Express.Response, next) {


            async function removeDoc(doc: Document, resource: Resource): Promise<any> {
                switch (resource.options.handleRemove) {
                    case 'allow':
                        // old behaviour - no attempt to maintain data integrity
                        return doc.deleteOne();
                    case 'cascade':
                        res.status(400).send('"cascade" option not yet supported')
                        break;
                    default:
                        return that.getDependencies(resource, doc._id)
                          .then((dependencies) => {
                              if (dependencies.length > 0) {
                                  throw new ForeignKeyError(resource.resourceName, dependencies);
                              }
                              return doc.deleteOne();
                          });
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
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
            const that = this;
            this.processEntity(req, res, function () {
                if (!req.resource) {
                    return next();
                }
                const returnRawParam = req.query?.returnRaw ? !!JSON.parse(req.query.returnRaw) : false;
                if (returnRawParam) {
                    const result = { _id: req.doc._id };
                    for (const field of req.resource.options.listFields) {
                        result[field.field] = req.doc[field.field];
                    }
                    return res.send(result);                    
                } else {
                    that.getListFields(req.resource, req.doc, function (err, display) {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            return res.send({list: display});
                        }
                    })
                }
            });
        }, this);
    };

    // To disambiguate the contents of items - assumed to be the results of a single resource lookup or search - 
    // pass the result of this function as the second argument to the disambiguate() function.
    // equalityProps should identify the property(s) of the items that must ALL be equal for two items to
    // be considered ambiguous.
    // disambiguationResourceName should identify the resource whose list field(s) should be used to generate
    // the disambiguation text for ambiguous results later.
    buildSingleResourceAmbiguousRecordStore<t>(items: t[], equalityProps: string[], disambiguationResourceName: string): fngServer.AmbiguousRecordStore<t> {
        const ambiguousResults: t[] = [];
        for (let i = 0; i < items.length - 1; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (!equalityProps.some((p) => items[i][p] !== items[j][p])) {
                    if (!ambiguousResults.includes(items[i])) {
                        ambiguousResults.push(items[i]);
                    }
                    if (!ambiguousResults.includes(items[j])) {
                        ambiguousResults.push(items[j]);
                    }
                }
            }
        }
        return { [disambiguationResourceName]: ambiguousResults };
    }

    // An alternative to buildSingleResourceAmbiguousRecordStore() for use when disambiguating the results of a
    // multi-resource lookup or search.  In this case, all items need to include the name of the resource that
    // will be used (when necessary) to yield their disambiguation text later.  The property of items that holds
    // that resource name should be identified by the disambiguationResourceNameProp parameter.
    // The scary-looking templating used here ensures that the items really do all have an (optional) string
    // property with the name identified by disambiguationResourceNameProp.  For the avoidance of doubt, "prop"
    // here could be anything - "foo in f" would achieve the same result.
    buildMultiResourceAmbiguousRecordStore<t extends { [prop in f]?: string }, f extends string>(
        items: t[],
        equalityProps: string[],
        disambiguationResourceNameProp: f
    ): fngServer.AmbiguousRecordStore<t> {
        const store: fngServer.AmbiguousRecordStore<t> = {};
        for (let i = 0; i < items.length - 1; i++) {
            for (let j = i + 1; j < items.length; j++) {
                if (
                    items[i][disambiguationResourceNameProp] &&
                    items[i][disambiguationResourceNameProp] === items[j][disambiguationResourceNameProp] &&
                    !equalityProps.some((p) => items[i][p] !== items[j][p])
                ) {
                    if (!store[items[i][disambiguationResourceNameProp]]) {
                        store[items[i][disambiguationResourceNameProp]] = [];
                    }
                    if (!store[items[i][disambiguationResourceNameProp]].includes(items[i])) {
                        store[items[i][disambiguationResourceNameProp]].push(items[i]);
                    }
                    if (!store[items[i][disambiguationResourceNameProp]].includes(items[j])) {
                        store[items[i][disambiguationResourceNameProp]].push(items[j]);
                    }
                }
            }
        }
        return store;       
    }

    // return just the id and list fields for all of the records from req.resource.
    // list fields are those whose schema entry has a value for the "list" attribute (except where this is { ref: true })
    // if the resource has no explicit list fields identified, the first string field will be returned.  if the resource
    // doesn't have any string fields either, the first (non-id) field will be returned.
    // usually, we will respond with an array of ILookupItem objects, where the .text property of those objects is the concatenation
    // of all of the document's list fields (space-seperated).
    // to request the documents without this transformation applied, include "c=true" in the query string.
    // the query string can also be used to filter and order the response, by providing values for "f" (find), "l" (limit),
    // "s" (skip) and/or "o" (order).
    // results will be disambiguated if req.resource includes disambiguation parameters in its resource options.
    // where c=true, the disambiguation will be added as a suffix to the .text property of the returned ILookupItem objects.
    // otherwise, if the resource has just one list field, the disambiguation will be appended to the values of that field, and if
    // it has multiple list fields, it will be returned as an additional property of the returned (untransformed) objects
    internalEntityListAll(req, callback: (err, resultsObject?) => void) {
        const projection = this.generateListFieldProjection(req.resource);
        const listFields = Object.keys(projection);
        const aggregationParam = req.query.a ? JSON.parse(req.query.a) : null;
        const findParam = req.query.f ? JSON.parse(req.query.f) : {};
        const limitParam = req.query.l ? JSON.parse(req.query.l) : 0;
        const skipParam = req.query.s ? JSON.parse(req.query.s) : 0;
        const orderParam = req.query.o ? JSON.parse(req.query.o) : req.resource.options.listOrder;
        const concatenateParam = req.query.c ? JSON.parse(req.query.c) : true;
        const resOpts = req.resource.options as fngServer.ResourceOptions;
        let disambiguationField: string;
        let disambiguationResourceName: string;
        if (resOpts?.disambiguation) {
            disambiguationField = resOpts.disambiguation.field;
            if (disambiguationField) {
                projection[disambiguationField] = 1;
                disambiguationResourceName = resOpts.disambiguation.resource;
            }
        }
        const that = this;
        this.filteredFind(req.resource, req, aggregationParam, findParam, projection, orderParam, limitParam, skipParam, function (err, docs) {
            if (err) {
                return callback(err);
            } else {
                docs = docs.map((d) => d.toObject());
                if (concatenateParam) {
                    const transformed: fngServer.DisambiguatableLookupItem[] = docs.map((doc: any) => {
                        let text = "";
                        for (const field of listFields) {
                            if (doc[field]) {
                                if (text !== "") {
                                    text += " ";
                                }
                                text += doc[field];
                            }                            
                        }
                        const disambiguationId = disambiguationField ? doc[disambiguationField] : undefined;
                        return { id: doc._id, text, disambiguationId };
                    });
                    if (disambiguationResourceName) {
                        that.disambiguate(
                            transformed,
                            that.buildSingleResourceAmbiguousRecordStore(transformed, ["text"], disambiguationResourceName),
                            "disambiguationId",
                            (item: fngServer.DisambiguatableLookupItem, disambiguationText: string) => {
                                item.text += ` (${disambiguationText})`;
                            },
                            (err) => {
                                callback(err, transformed); 
                            }
                        );
                    } else {
                        return callback(null, transformed);
                    }                    
                } else {
                    if (disambiguationResourceName) {
                        that.disambiguate(
                            docs,
                            that.buildSingleResourceAmbiguousRecordStore(docs, listFields, disambiguationResourceName),
                            disambiguationField,
                            (item, disambiguationText: string) => {
                                if (listFields.length === 1) {
                                    item[listFields[0]] += ` (${disambiguationText})`;
                                } else {
                                    // store the text against hard-coded property name "disambiguation", rather than (say) using 
                                    // item[disambiguationResourceName], because if disambiguationResourceName === disambiguationField,
                                    // that value would end up being deleted again when the this.disambiguate() call (which we have
                                    // been called from) does its final tidy-up and deletes [disambiguationField] from all of the items in docs
                                    item.disambiguation = disambiguationText;
                                }
                            },
                            (err) => {
                                callback(err, docs); 
                            }
                        );
                    } else {
                        return callback(null, docs);
                    }                    
                }                    
            }
        });
    };

    entityListAll() {
        return _.bind(function (req: Express.Request, res: Express.Response, next) {
            if (!(req.resource = this.getResource(req.params.resourceName))) {
                return next();
            }
            this.internalEntityListAll(req, function (err, resultsObject) {
                if (err) {
                    res.status(400, err)
                } else {
                    res.send(resultsObject);
                }
            });
        }, this);
    };

    extractTimestampFromMongoID(record: any): Date {
        let timestamp = record.toString().substring(0, 8);
        return new Date(parseInt(timestamp, 16) * 1000);
    }

}

class ForeignKeyError extends global.Error {
    constructor(resourceName: string, foreignKeys: ForeignKeyList) {
        super(`Cannot delete this ${resourceName}, as it is: ${foreignKeys.map(d => ` the ${d.key} on ${d.resourceName} ${d.id}`).join("; ")}`);
        this.name = "ForeignKeyError";
        this.stack = (<any>new global.Error('')).stack;
    }
}
