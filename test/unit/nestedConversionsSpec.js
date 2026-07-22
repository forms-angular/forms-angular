'use strict';

// Conversions (used by lookup fields such as fng-ui-select to turn a stored id into the {id, text}
// object the control displays) have to reach fields inside an array nested within a sub-schema array.
// Addressing those needs one array index per level of nesting - with a single offset the value was
// written to the wrong row, or not at all, and the control appeared blank despite holding a value.
describe('conversions in nested sub-schemas', function () {

  var RecordHandlerService, scope, realElement;

  beforeEach(angular.mock.module('formsAngular'));

  beforeEach(inject(function ($rootScope, _RecordHandlerService_) {
    RecordHandlerService = _RecordHandlerService_;
    scope = $rootScope.$new();
    scope.topLevelFormName = 'myForm';
    // The conversion callback looks the input up by id to preserve its pristine state.  The browser
    // has jQuery, but karma loads angular with bare jqLite, which throws on a selector - so resolve
    // id selectors against the document ourselves.  Only the lookup is stubbed; everything under
    // test runs for real.
    realElement = angular.element;
    spyOn(angular, 'element').and.callFake(function (arg) {
      if (typeof arg === 'string' && arg.charAt(0) === '#') {
        return realElement(document.getElementById(arg.slice(1)) || document.createElement('div'));
      }
      return realElement(arg);
    });
  }));

  // studies.courses[] -> teachers[] -> teacher, mirroring the h_deep_nesting fixture
  var schema = [
    {
      name: 'studies.courses', id: 'f_studies_courses', label: 'Courses', schema: [
        { name: 'studies.courses.subject', label: 'Subject', type: 'text' },
        {
          name: 'studies.courses.teachers', id: 'f_studies_courses_teachers', label: 'Teachers', schema: [
            { name: 'teachers.teacher', label: 'Teacher', type: 'text' },
            { name: 'teachers.room', label: 'Room', type: 'number' }
          ]
        }
      ]
    }
  ];

  function makeRecord() {
    return {
      studies: {
        courses: [
          { subject: 'Maths', teachers: [{ teacher: 'aaaaaaaaaaaaaaaaaaaaaaa1', room: 101 }] },
          {
            subject: 'Physics', teachers: [
              { teacher: 'aaaaaaaaaaaaaaaaaaaaaaa2', room: 201 },
              { teacher: 'aaaaaaaaaaaaaaaaaaaaaaa3', room: 202 }
            ]
          }
        ]
      }
    };
  }

  it('applies a conversion to a field two arrays deep, in the right row', function (done) {
    var converted = [];
    scope.record = makeRecord();
    // registered the way a plugin directive registers one: keyed by the field name as the directive
    // saw it, which inside a sub-schema is relative to the array that owns it
    scope.conversions = {
      teachers: {
        teacher: {
          fngajax: function (value, schemaEntry, callback) {
            converted.push(value);
            callback(schemaEntry, { id: value, text: 'Teacher ' + value.slice(-1) });
          }
        }
      }
    };

    RecordHandlerService.convertToAngularModelWithSchema(schema, scope.record, scope).then(function () {
      var courses = scope.record.studies.courses;
      // every nested row is converted...
      expect(converted.length).toBe(3);
      // ...and each lands in its own row, rather than all writing over the first
      expect(courses[0].teachers[0].teacher.text).toBe('Teacher 1');
      expect(courses[1].teachers[0].teacher.text).toBe('Teacher 2');
      expect(courses[1].teachers[1].teacher.text).toBe('Teacher 3');
      // untouched siblings are left alone
      expect(courses[1].teachers[1].room).toBe(202);
      done();
    }, done.fail);
  });

  it('still converts a field a single array deep', function (done) {
    scope.record = makeRecord();
    // here registered under the full path, the other form a registration can take
    scope.conversions = {
      studies: {
        courses: {
          subject: {
            fngajax: function (value, schemaEntry, callback) {
              callback(schemaEntry, { id: value, text: value.toUpperCase() });
            }
          }
        }
      }
    };

    RecordHandlerService.convertToAngularModelWithSchema(schema, scope.record, scope).then(function () {
      expect(scope.record.studies.courses[0].subject.text).toBe('MATHS');
      expect(scope.record.studies.courses[1].subject.text).toBe('PHYSICS');
      done();
    }, done.fail);
  });
});
