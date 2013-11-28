# forms-angular

## 0.1 to 0.2
### Summary
* Internal changes to make better use of Angular JS forms capabilities

### BREAKING CHANGES
* Changed form-input directive so that it creates a form tag, and rather than creating a <form-input>
per sub document it now creates a <ng-form> and builds the sub-form in the same pass.  Only when using
directives are multiple passes required.

## 0.0.x to 0.1.0
### Summary
* Started CHANGELOG.md (but for now it is far from definitive, but is intended to include all breaking changes)
* Added support for containers (documented in Custom Form Schemas section of documentation)
* Added reporting capability
* New website

### BREAKING CHANGES
* Changes form-input directive so that it expects
```
    <form-input schema="formSchema">
```    
instead of
```
    <form-input ng-repeat="field in formSchema" info={{field}}>
```
* findFunc option now returns a query object such as
```
    {field:'value'}
```
rather than a MongooseJS Query such as
```
    model.find().where('field', 'value')
```
* Bespoke directives need to be modified (changes will normally be from something like
```
    var info = JSON.parse(attrs.info);
```
to
```
    var info = scope[attrs.schema][0];
```
* One formInputDone is broadcast per form (instead of per field).
