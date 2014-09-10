# ROADMAP

There are no ETAs for any of these.  If you would like to help with anything please let me know in 
IRC channel #forms-angular (or any other way that want).  Headings are not great - if you don't see 
something you want under the heading you expect it to be under - keep looking!

## Architecture

* Refactor form-input directive (for readability and to make it easier to support other CSS frameworks)
* Split schema handling out of Base control
* Add support for SQL databases (maybe using sequelize.js)
* Cache scheams / lookups
* Decouple select2 from incoming mongoose schema options, so it can be used with form schema 
 
## Form improvements
 
* Allow sorting of arrays / sub docs
* Make multi level nesting work properly
* Masked input
* Allow [x] view password in password fields on mobile 
* Inplace edit
* Direct access to a given tab through route
* Add Home / End key capability to search results

## Plugins

* File upload to S3
* Add gallery to fng-jq-upload

## Documentation

* Improve proper documentation for form schema json
* Explain (and maybe rename) list fields
