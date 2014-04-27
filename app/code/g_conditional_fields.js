'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GSchema = new Schema({
    surname: {type: String, list:{}, index:true},
    forename:  {type: String, list:true, index:true},
    sex: {type: String, enum:['F','M']},
    accepted: {type:Boolean, form:{help:'When someone is accepted additional fields appear'}},
    startDate:{type:Date, form:{showWhen: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    startingPosition:{type:String, form:{showWhen: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    bribeAmount: {type: Number, form:{help:'Try a number between 10 and 200 to see an angular expression used in a conditional'}},
    loggedInBribeBook: {type: Boolean, form:{showWhen:'record.bribeAmount >= 10 && record.bribeAmount <= 200'}}
});

var G;
try {G = mongoose.model('G');} catch(e) {G = mongoose.model('G', GSchema);}

GSchema.statics.report = function(report) {
    var reportSchema = '';
    switch (report) {
        case 'breakdownbysex' :
            reportSchema = {
                pipeline: [{$group:{_id:'$sex',count:{'$sum':1}}}],
                title: 'Numbers of Applicants By Sex',
                columnDefs: [{field:'_id', displayName:'Sex',totalsRow:'Total', 'width':'160px'}, {field:'count', displayName:'No of Applicants',totalsRow:'$SUM','width':'160px', 'cellFilter':'number', 'align':'right'}],
                columnTranslations: [{field:'_id', translations:[{value:'M', display:'Male'},{value:'F', display:'Female'}]}]
            };
            break;
        case 'totalforonesex' :
            reportSchema = {
                'pipeline':[{'$match':{'sex':'(sex)'}},{'$group':{'_id':'$sex','count':{'$sum':1}}}],
                'title':'Numbers of Applicants By Sex',
                'columnDefs':[{'field':'_id','displayName':'Sex','width':'200'},{'field':'count','displayName':'No of Applicants','align':'right', 'width':'200'}],
                'columnTranslations': [{'field':'_id','translations':[{'value':'M', 'display':'Male'},{'value':'F','display':'Female'}]}],
                'params':{'sex':{value:'M', type: 'select', enum:['Male','Female'], required:true, conversionExpression: 'param[0]'}}
            };
            break;
        case 'totals' :
            reportSchema = {
                'pipeline':[{'$project':{'surname':1,'forename':1,'bribeAmount':1, '_id':1}}],
                'title':'A report with totals and drilldown',
                drilldown: '/#!/g_conditional_fields/|_id|/edit',
                'columnDefs':[{'field':'surname','displayName':'Surname','width':'200', totalsRow:'Total'},{'field':'forename','displayName':'Forename','width':200},{'field':'bribeAmount','displayName':'Bribe','align':'right', 'width':'200', totalsRow:'$SUM', 'cellFilter':'currency'}]
            };
            break;
        case 'functiondemo' :
            reportSchema = {
                'pipeline':[{'$group':{'_id':'$sex','count':{'$sum':1},'functionResult':{'$sum':1}}}],
                'title':'Numbers of Applicants By Sex',
                'columnDefs':[{'field':'_id','displayName':'Sex','width':'200'},{'field':'count','displayName':'No of Applicants','align':'right', 'width':'200'}, {'field':'functionResult','displayName':'Applicants + 10','align':'right', 'width':'200'}],
                'columnTranslations': [{'field':'_id','translations':[{'value':'M', 'display':'Male'},{'value':'F','display':'Female'}]}, {field:'functionResult',
                fn: function(row,cb) {
                    row.functionResult = row.functionResult + 10;
                    cb();
                }}]
            };
            break;
        case 'selectbynumber' :
            reportSchema = {
                'pipeline':[
                    {'$group':{'_id':'$sex','count':{'$sum':1}}},
                    {'$match':{'count':'(number_param)'}}
                ],
                'params':{'number_param':{value:11, type:'number',required:true}}
            };
            break;
    }
    return reportSchema;
};

module.exports = {
    model : G,
    searchImportance: 1,
    searchOrder: {surname:1},
    listOrder: {surname:1}
};


//    'pipeline':[{'$group':{'_id':'$sex','count':{'$sum':1}}},{'$match':{'count':'(number_param)'}}],'params':{'number_param':11}
