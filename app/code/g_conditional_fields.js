var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GSchema = new Schema({
    surname: {type: String, list:{}, index:true},
    forename:  {type: String, list:true, index:true},
    sex: {type: String, enum:['F','M']},
    accepted: {type:Boolean, form:{help:'When someone is accepted additional fields appear'}},
    startDate:{type:Date, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    startingPosition:{type:String, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    bribeAmount: Number
});

var G;
try {G = mongoose.model('G') } catch(e) {G = mongoose.model('G', GSchema)}

GSchema.statics.report = function(report) {
    var reportSchema = '';
    switch (report) {
        case 'breakdownbysex' :
            reportSchema = {
                pipeline: [{$group:{_id:"$sex",count:{"$sum":1}}}],
                title: "Numbers of Applicants By Sex",
                columnDefs: [{field:'_id', displayName:'Sex'}, {field:'count', displayName:'No of Applicants'}],
                columnTranslations: [{field:'_id', translations:[{value:'M', display:'Male'},{value:'F', display:'Female'}]}]
            };
            break;
        case 'totalforonesex' :
            reportSchema = {
                "pipeline":[{"$match":{"sex":"(sex)"}},{"$group":{"_id":"$sex","count":{"$sum":1}}}],
                "title":"Numbers of Applicants By Sex",
                "columnDefs":[{"field":'_id',"displayName":'Sex'},{"field":'count',"displayName":'No of Applicants'}],
                "columnTranslations": [{"field":'_id',"translations":[{"value":'M', "display":'Male'},{"value":'F',"display":'Female'}]}],
                "params":{"sex":{value:'Male', type: 'select', enum:['Male','Female'], required:true, conversionExpression: "param[0]"}}
            };
            break;
        case 'selectbynumber' :
            reportSchema = {
                "pipeline":[
                    {"$group":{"_id":"$sex","count":{"$sum":1}}},
                    {"$match":{"count":"(number_param)"}}
                ],
                "params":{"number_param":{value:11, type:'number',required:true}}
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


//    "pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}},{"$match":{"count":"(number_param)"}}],"params":{"number_param":11}
