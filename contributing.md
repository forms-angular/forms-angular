# Contributing

We are more than happy to accept external contributions to the project in the form of feedback, bug reports and even better - pull requests :) 

## Issue submission (for questions / bugs etc)

In order for us to help you please check that you've completed the following steps:

* Made sure you're on the latest version (which is [here](https://github.com/forms-angular/forms-angular/releases/latest) for live code and the HEAD of `master` branch if you are working with pre-release code.
* Used the search feature to ensure that the bug hasn't been reported before
* Included as much information about the bug as possible, including any output you've received, what OS and version you're on, etc.
[Submit your issue](https://github.com/forms-angular/forms-angular/issues/new)

## Style Guide

There is a picky .jshintrc file that will be used when you run grunt.  The main points are that the project uses single-quotes, 
two space indentation, multiple var statements and whitespace around arguments. Use a single space after keywords like `function`.

## Pull Request Guidelines

* Please check to make sure that there aren't existing pull requests attempting to address the issue mentioned. We also recommend checking for issues related to the issue on the tracker, as a team member may be working on the issue in a branch or fork.
* Non-trivial changes should be discussed in an issue or #forms-angular on IRC first
* Develop in a topic branch, not master
* Add relevant tests to cover the change
* Lint the code and run unit tests by running `grunt`
* Run the end to end tests in the [website repo](https://github.com/forms-angular/website) by doing the following:
  * Run the website with `NODE_ENV=test` using your up to date forms-angular (`npm link` and `bower link` are useful here)
  * Change the port number in the relavant protractor config file(s) in test/e2e/protractor*.conf.js
  * Run `protractor test/e2e/protractor-firefox.conf.js` (the more browsers the better)
* Squash your commits
* Write a convincing description of your PR and why we should land it
* Please submit PRs to the `master` branch, it is the main development branch for this repo.
