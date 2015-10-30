# Contributing

We are more than happy to accept external contributions to the project in the form of feedback, bug reports and even better - pull requests :) 

## Issue submission (for questions / bugs etc)

In order for us to help you please check that you've completed the following steps:

* Made sure you're on the latest version (which is [here](https://github.com/forms-angular/forms-angular/releases/latest) for live code and the HEAD of `master` branch if you are working with pre-release code.
* Used the search feature to ensure that the bug hasn't been reported before
* Included as much information about the bug as possible, including any output you've received, what OS and version you're on, etc.
[Submit your issue](https://github.com/forms-angular/forms-angular/issues/new)

## Style Guide

There is a picky .jshintrc file, but it is not part of the build process since the move to typsescript.  The main points are that the project uses single-quotes, 
two space indentation, multiple var statements and whitespace around arguments. Use a single space after keywords like `function`.

## Pull Request Guidelines

* Please check to make sure that there aren't existing pull requests attempting to address the issue mentioned. We also recommend checking for issues related to the issue on the tracker, as a team member may be working on the issue in a branch or fork.
* Non-trivial changes should be discussed in an issue or #forms-angular on IRC first
* Develop in a topic branch, not master
* Add relevant tests to cover the change
* Build and run unit tests by running `npm test` (or `gulp all` which runs the tests after a build).
* Run the end to end tests in the [website repo](https://github.com/forms-angular/website) by running `grunt test` <sup>1</sup>
* Squash your commits
* Write a convincing description of your PR and why we should land it
* Please submit PRs to the `master` branch, it is the main development branch for this repo.


<sup>1</sup> Many of the e2e tests in website generate screen shot PNG files.  This enables a quick visual check that no 
unintended changes have been made to the UI.  The best way to use this is as follows:

In your .gitconfig in your home folder add a section

```
[diff "image"]
	command = ~/bin/git-imgdiff
```

where the ~/bin/git-imgdiff file referred to is

```
#!/bin/sh
compare "$2" "$1" png:- | montage -geometry +4+4 "$2" - "$1" png:- | display -title "$1"
```

compare is part of [ImageMagick](http://www.imagemagick.org/script/index.php)
