# forms-angular

## 0.1 to 0.2
### Summary
* Added support for hierarchy fields
* Added schema
* Form is now created within the form-input directive

### BREAKING CHANGES
* Changes form-input directive so that it creates a

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
