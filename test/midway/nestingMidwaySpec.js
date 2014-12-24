'use strict';

describe('nesting', function () {
  var elm, scope, ctrl, $httpBackend;

  beforeEach(function () {
      angular.mock.module('formsAngular');
      angular.mock.module('template/form-button-bs2.html');
    }
  );

  describe('Nested schemas set button state', function () {

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, $location, $compile) {
      $httpBackend = _$httpBackend_;

      $httpBackend.whenGET('/api/schema/collection').respond({
        'surname': {
          'path': 'surname',
          'instance': 'String',
          'options': {
            'list': {}
          }
        },
        'forename': {
          'path': 'forename',
          'instance': 'String',
          'options': {
            'list': true
          }
        },
        'address.street': {
          'path': 'address.street',
          'instance': 'String'
        },
        'address.town': {
          'path': 'address.town',
          'instance': 'String'
        },
        'studies.courses': {
          'schema': {
            'subject': {
              'path': 'subject',
              'instance': 'String'
            },
            'grade': {
              'path': 'grade',
              'instance': 'String'
            },
            'teachers': {
              'schema': {
                'teacher': {
                  'path': 'teacher',
                  'instance': 'ObjectID',
                  'options': {
                    'ref': 'b_using_options'
                  }
                },
                'room': {
                  'path': 'room',
                  'instance': 'Number'
                },
                '_id': {
                  'path': '_id',
                  'instance': 'ObjectID',
                  'setters': [
                    null
                  ],
                  'options': {
                    'auto': true
                  }
                }
              }
            },
            '_id': {
              'path': '_id',
              'instance': 'ObjectID',
              'setters': [
                null
              ],
              'options': {
                'auto': true
              }
            }
          },
          'options': {
            'form': {
              'noRemove': true
            }
          }
        },
        'studies.exams': {
          'schema': {
            'subject': {
              'path': 'subject',
              'instance': 'String'
            },
            'examDate': {
              'path': 'examDate',
              'instance': 'Date'
            },
            'score': {
              'path': 'score',
              'instance': 'Number'
            },
            'result': {
              'enumValues': [
                'distinction',
                'merit',
                'pass',
                'fail'
              ],
              'path': 'result',
              'instance': 'String',
              'validators': [
                [
                  null,
                  '`{VALUE}` is not a valid enum value for path `{PATH}`.',
                  'enum'
                ]
              ],
              'options': {
                'enum': [
                  'distinction',
                  'merit',
                  'pass',
                  'fail'
                ]
              }
            },
            'grader': {
              'path': 'grader',
              'instance': 'ObjectID',
              'options': {
                'ref': 'b_using_options'
              }
            },
            '_id': {
              'path': '_id',
              'instance': 'ObjectID',
              'setters': [
                null
              ],
              'options': {
                'auto': true
              }
            }
          }
        },
        'assistants': {
          'caster': {
            'path': 'assistants',
            'instance': 'ObjectID',
            'options': {
              'ref': 'b_using_options'
            },
            '_index': null
          },
          'path': 'assistants',
          'options': {
            'type': [
              {
                'ref': 'b_using_options'
              }
            ]
          }
        },
        '_id': {
          'path': '_id',
          'instance': 'ObjectID',
          'setters': [
            null
          ],
          'options': {
            'auto': true
          }
        }
      });
      $httpBackend.whenGET('/api/schema/b_using_options').respond({
        'surname': {
          'path': 'surname',
          'instance': 'String',
          'validators': [
            [
              null,
              'Path `{PATH}` is required.',
              'required'
            ]
          ],
          'options': {
            'required': true,
            'index': true,
            'list': {}
          },
          '_index': true,
          'isRequired': true
        },
        'forename': {
          'path': 'forename',
          'instance': 'String',
          'options': {
            'list': true,
            'index': true
          },
          '_index': true
        },
        'login': {
          'path': 'login',
          'instance': 'String',
          'options': {
            'secure': true,
            'form': {
              'hidden': true
            }
          }
        },
        'passwordHash': {
          'path': 'passwordHash',
          'instance': 'String',
          'options': {
            'secure': true,
            'form': {
              'hidden': true
            }
          }
        },
        'address.line1': {
          'path': 'address.line1',
          'instance': 'String',
          'options': {
            'form': {
              'label': 'Address'
            }
          }
        },
        'address.line2': {
          'path': 'address.line2',
          'instance': 'String',
          'options': {
            'form': {
              'label': null
            }
          }
        },
        'address.line3': {
          'path': 'address.line3',
          'instance': 'String',
          'options': {
            'form': {
              'label': null,
              'add': 'class=\'some classes here\''
            }
          }
        },
        'address.town': {
          'path': 'address.town',
          'instance': 'String',
          'options': {
            'form': {
              'label': 'Town',
              'placeHolder': 'Post town'
            }
          }
        },
        'address.postcode': {
          'path': 'address.postcode',
          'instance': 'String',
          'options': {
            'form': {
              'label': 'Postcode',
              'size': 'small',
              'help': 'Enter your postcode or zip code'
            }
          }
        },
        'address.country': {
          'path': 'address.country',
          'instance': 'String',
          'options': {
            'form': {
              'label': 'Country',
              'hidden': true
            }
          }
        },
        'address.surveillance': {
          'path': 'address.surveillance',
          'instance': 'boolean',
          'options': {
            'secure': true,
            'form': {
              'hidden': true
            }
          },
          '_index': null
        },
        'email': {
          'path': 'email',
          'instance': 'String',
          'options': {
            'index': true,
            'noSearch': true,
            'form': {
              'directive': 'email-field'
            }
          },
          '_index': true
        },
        'weight': {
          'path': 'weight',
          'instance': 'Number',
          'options': {
            'form': {
              'label': 'Weight (lbs)'
            }
          }
        },
        'eyeColour': {
          'enumValues': [
            'Blue',
            'Brown',
            'Green',
            'Hazel'
          ],
          'path': 'eyeColour',
          'instance': 'String',
          'validators': [
            [
              null,
              '`{VALUE}` is not a valid enum value for path `{PATH}`.',
              'enum'
            ]
          ],
          'options': {
            'enum': [
              'Blue',
              'Brown',
              'Green',
              'Hazel'
            ],
            'required': false,
            'form': {
              'placeHolder': 'Select eye colour',
              'select2': {},
              'help': 'This control has had an event handler added to it (which looks horrid - sorry!).  See bottom of <a href=\'/#/index#postprocessing\'>home page</a> for details.'
            }
          },
          'isRequired': false
        },
        'dateOfBirth': {
          'path': 'dateOfBirth',
          'instance': 'Date'
        },
        'accepted': {
          'path': 'accepted',
          'instance': 'boolean',
          'validators': [
            [
              null,
              'Path `{PATH}` is required.',
              'required'
            ]
          ],
          'options': {
            'required': true,
            'form': {
              'helpInline': 'Did we take them?'
            },
            'list': {}
          },
          'isRequired': true
        },
        'interviewScore': {
          'path': 'interviewScore',
          'instance': 'Number',
          'options': {
            'form': {
              'hidden': true
            },
            'list': {}
          }
        },
        'freeText': {
          'path': 'freeText',
          'instance': 'String',
          'options': {
            'form': {
              'type': 'textarea',
              'rows': 5,
              'help': 'There is some validation on this field to ensure that the word \'rude\' is not entered.  Try it to see the record level error handling.'
            }
          }
        },
        'resizingText': {
          'path': 'resizingText',
          'instance': 'String',
          'options': {
            'form': {
              'type': 'textarea',
              'rows': 'auto',
              'help': 'This field resizes thanks to the <a href=\'http://monospaced.github.io/angular-elastic/\'>angular-elastic</a> module'
            }
          }
        },
        'ipAddress': {
          'path': 'ipAddress',
          'instance': 'String',
          'options': {
            'form': {
              'hidden': true
            }
          }
        },
        'password': {
          'path': 'password',
          'instance': 'String'
        },
        '_id': {
          'path': '_id',
          'instance': 'ObjectID',
          'setters': [
            null
          ],
          'options': {
            'auto': true
          }
        }
      });
      $httpBackend.whenGET('/api/b_using_options').respond([
        {
          '_id': '519a6075b320153869b155e0',
          'accepted': true,
          'email': 'ReportingIndex@somewhere.com',
          'eyeColour': 'Brown',
          'forename': 'John',
          'freeText': 'This is a polite thing 1385563125379',
          'interviewScore': 89,
          'ipAddress': '127.0.0.1',
          'surname': 'IsAccepted',
          'weight': 124,
          'address': {
            'line1': '4 High Street',
            'town': 'Anytown',
            'postcode': 'AB2 3ES'
          }
        }
      ]);

      $httpBackend.whenGET('/api/collection/123').respond({
        '_id': 123,
        'surname': 'Smith',
        'forename': 'John',
        'address.street': '4 High Street',
        'address.town': 'Anytown',
        'studies': {
          'courses': [
            {
              'subject': 'English',
              'grade': 'A',
              'teachers': []
            }
          ],
          'exams': [
            {
              'subject': 'English',
              'score': 67,
              'result': 'merit'
            }
          ]
        }
      });

      elm = angular.element('<div><div form-buttons></div><form-input schema="formSchema"></form-input></div>');
      scope = $rootScope.$new();
      $location.$$path = '/collection/123/edit';
      ctrl = $controller('BaseCtrl', {$scope: scope});
      $httpBackend.flush();
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('disables save button until a change is made', function () {
      expect(scope.isSaveDisabled()).toEqual(true);
    });

    it('disables cancel button until a change is made', function () {
      expect(scope.isCancelDisabled()).toEqual(true);
    });

    it('enables save button when a subDoc is deleted', function () {
      var noDocs = scope.record.studies.exams.length;
      var buttons = elm.find('button');
      var button = angular.element(buttons[buttons.length-2]);
      expect(button.text()).toMatch(/Remove/);
      scope.remove('studies.exams', 0, {target: button});
      expect(scope.record.studies.exams.length).toEqual(noDocs-1);
      expect(scope.isSaveDisabled()).toEqual(false);
    });

    it('enables save button when a subDoc is added', function () {
      var noDocs = scope.record.studies.exams.length;
      var buttons = elm.find('button');
      var button = angular.element(buttons[buttons.length-1]);
      expect(button.text()).toMatch(/Add/);
      scope.add('studies.exams', {target: button});
      expect(scope.record.studies.exams.length).toEqual(noDocs+1);
      expect(scope.isSaveDisabled()).toEqual(false);
    });

  });

});

