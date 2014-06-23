'use strict';

describe('formInput', function () {
  var elm, scope;

  // load the form code
  beforeEach(angular.mock.module('formsAngular'));

  describe('simple text input', function () {

    beforeEach(inject(function ($rootScope, $compile) {
      elm = angular.element(
          '<form name="myForm" class="form-horizontal compact">' +
          '<form-input schema="formSchema"></form-input>' +
          '</form>');

      scope = $rootScope;
      scope.formSchema = [
        {'name': 'surname', 'id': 'f_surname', 'label': 'Surname', 'type': 'text', 'add': 'autofocus '},
        {'name': 'forename', 'id': 'f_forename', 'label': 'Forename', 'type': 'text'},
        {'name': 'address.street', 'id': 'f_address_street', 'label': 'Address Street', 'type': 'text'},
        {'name': 'address.town', 'id': 'f_address_town', 'label': 'Address Town', 'type': 'text'},
        {'name': 'studies.courses', 'id': 'f_studies_courses', 'label': 'Studies Courses', 'noRemove': true, 'schema': [
          {'name': 'studies.courses.subject', 'id': 'f_studies.courses.subject', 'label': 'Subject', 'type': 'text', 'add': 'autofocus '},
          {'name': 'studies.courses.grade', 'id': 'f_studies.courses.grade', 'label': 'Grade', 'type': 'text'},
          {'name': 'studies.courses.teachers', 'id': 'f_studies.courses.teachers', 'label': 'Teachers', 'schema': [
            {
              'name': 'teachers.teacher',
              'id': 'f_teachers.teacher',
              'label': 'Teacher',
              'ref': 'b_using_options',
              'type': 'select',
              'options': 'f_teachers_teacherOptions',
              'ids': 'f_teachers_teacher_ids'
            },
            {'name': 'teachers.room', 'id': 'f_teachers.room', 'label': 'Room', 'type': 'number'}
          ]
          }
        ]
        },
        {'name': 'studies.exams', 'id': 'f_studies_exams', 'label': 'Studies Exams', 'schema': [
          {'name': 'studies.exams.subject', 'id': 'f_studies.exams.subject', 'label': 'Subject', 'type': 'text', 'add': 'autofocus autofocus '},
          {'name': 'studies.exams.examDate', 'id': 'f_studies.exams.examDate', 'label': 'Exam Date', 'type': 'text', 'add': 'ui-date ui-date-format=\'dd/mm/yy\' '},
          {'name': 'studies.exams.score', 'id': 'f_studies.exams.score', 'label': 'Score', 'type': 'number'},
          {'name': 'studies.exams.result', 'id': 'f_studies.exams.result', 'label': 'Result', 'type': 'select', 'options': 'f_studies_exams_resultOptions'},
          {
            'name': 'studies.exams.grader',
            'id': 'f_studies.exams.grader',
            'label': 'Grader',
            'ref': 'b_using_options',
            'type': 'select',
            'options': 'f_studies_exams_graderOptions',
            'ids': 'f_studies_exams_grader_ids'
          }
        ]
        }
      ];

      scope.record = {
        'surname': 'Smith',
        'forename': 'John',
        'address.street': '4 High Street',
        'address.town': 'Anytown',
        'studies': {
          'courses': [
            {'subject': 'English', 'grade': 'A', 'teachers': []}
          ],
          'exams': [
            {
              'subject': 'English',
              'score': 67,
              'result': 'merit'
            }
          ]
        }
      };
      $compile(elm)(scope);
      scope.$digest();
    }));

    it('should display the studies courses data', function () {
      var input = elm.find('input');
      expect(input).toHaveNameCount('studies-courses-grade', 1);
      expect(angular.element(input[5]).val()).toBe('A');
    });

    it('should display the studies exam data', function () {
      var input = elm.find('input');
      expect(input).toHaveNameCount('studies-exams-score', 1);
      expect(angular.element(input[8]).val()).toBe('67');
    });

  });

});

// <form name="myForm" class="form-horizontal compact ng-scope ng-pristine ng-valid">
// <div class="control-group ng-scope" id="cg_f_surname">
// <label class="control-label" for="f_surname">Surname</label>
// <div class="controls">
// <input ng-model="record.surname" id="f_surname" name="f_surname" autofocus="" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_forename">
// <label class="control-label" for="f_forename">Forename</label>
// <div class="controls">
// <input ng-model="record.forename" id="f_forename" name="f_forename" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_address_street">
// <label class="control-label" for="f_address_street">Address Street</label>
// <div class="controls">
// <input ng-model="record.address.street" id="f_address_street" name="f_address_street" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_address_town">
// <label class="control-label" for="f_address_town">Address Town</label>
// <div class="controls">
// <input ng-model="record.address.town" id="f_address_town" name="f_address_town" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies_courses">
// <div class="schema-head well">Studies Courses</div>
// <!-- ngRepeat: subDoc in record.studies.courses track by $index -->
// <div class="sub-doc well ng-scope" id="f_studies_coursesList_0" ng-repeat="subDoc in record.studies.courses track by $index">
// <div class="row-fluid">
// <div class="pull-left">
// <div class="control-group ng-scope" id="cg_f_studies.courses.subject">
// <label class="control-label" for="f_studies.courses.subject">Subject</label>
// <div class="controls">
// <input ng-model="record.studies.courses.0.subject" id="studies-courses-0-subject" name="studies-courses-0-subject" autofocus="" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.courses.grade">
// <label class="control-label" for="f_studies.courses.grade">Grade</label>
// <div class="controls">
// <input ng-model="record.studies.courses.0.grade" id="studies-courses-0-grade" name="studies-courses-0-grade" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.courses.teachers">
// <div class="schema-head well">Teachers</div>
// <!-- ngRepeat: subDoc in record.studies.courses.teachers track by $index -->
// <div class="schema-foot well">
// <button id="add_f_studies.courses.teachers_btn" class="btn btn-mini form-btn" ng-click="add(\"studies.courses.teachers\")"><i class="icon-plus"></i> Add</button>
// </div>
// </div>
// </div>
// </div>
// </div>
// <div class="schema-foot well">
// <button id="add_f_studies_courses_btn" class="btn btn-mini form-btn" ng-click="add(\"studies.courses\")"><i class="icon-plus"></i> Add</button>
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies_exams">
// <div class="schema-head well">Studies Exams</div>
// <!-- ngRepeat: subDoc in record.studies.exams track by $index -->
// <div class="sub-doc well ng-scope" id="f_studies_examsList_0" ng-repeat="subDoc in record.studies.exams track by $index">
// <div class="row-fluid">
// <div class="pull-left">
// <div class="control-group ng-scope" id="cg_f_studies.exams.subject">
// <label class="control-label" for="f_studies.exams.subject">Subject</label>
// <div class="controls">
// <input ng-model="record.studies.exams.0.subject" id="studies-exams-0-subject" name="studies-exams-0-subject" autofocus="" type="text" class="ng-pristine ng-valid">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.exams.examDate">
// <label class="control-label" for="f_studies.exams.examDate">Exam Date</label>
// <div class="controls">
// <input ng-model="record.studies.exams.0.examDate" id="studies-exams-0-examDate" name="studies-exams-0-examDate" ui-date=""
//      ui-date-format="dd/mm/yy" type="text" class="ng-pristine ng-valid hasDatepicker">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.exams.score">
// <label class="control-label" for="f_studies.exams.score">Score</label>
// <div class="controls">
// <input ng-model="record.studies.exams.0.score" id="studies-exams-0-score" name="studies-exams-0-score" type="number" class="ng-pristine ng-valid ng-valid-number">
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.exams.result">
// <label class="control-label" for="f_studies.exams.result">Result</label>
// <div class="controls">
// <select ng-model="record.studies.exams.0.result" id="studies-exams-0-result" name="studies-exams-0-result" class="ng-pristine ng-valid">
// <option value="? string:merit ?">
// </option>
// <option value="">
// </option>
// <!-- ngRepeat: option in f_studies_exams_resultOptions -->
// </select>
// </div>
// </div>
// <div class="control-group ng-scope" id="cg_f_studies.exams.grader">
// <label class="control-label" for="f_studies.exams.grader">Grader</label>
// <div class="controls">
// <select ng-model="record.studies.exams.0.grader" id="studies-exams-0-grader" name="studies-exams-0-grader" class="ng-pristine ng-valid">
// <option value=""></option>
// <!-- ngRepeat: option in f_studies_exams_graderOptions -->
// </select>
// </div>
// </div>
// </div>
// <div class="pull-left sub-doc-btns">
// <button id="remove_f_studies_exams_btn" class="btn btn-mini form-btn" ng-click="remove(\"studies.exams\",$index)"><i class="icon-minus"></i> Remove</button>
// </div>
// </div>
// </div>
// <div class="schema-foot well">
// <button id="add_f_studies_exams_btn" class="btn btn-mini form-btn" ng-click="add(\"studies.exams\")"><i class="icon-plus"></i> Add</button>
// </div>
// </div>
// </form>"


//   Cannot get this test to work, but the code seems to....
//    describe('handles sub documents', function() {
//        var scope, ctrl, compile, elm;
//
//        beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller, $compile) {
//            $httpBackend = _$httpBackend_;
//            compile = $compile;
//            $httpBackend.whenGET('api/schema/collection').respond(
//                {   'name':{'path':'name','instance':'String','options':{'list':true},'_index':null},
//                    'nested.aField':{'path':'nested.aField','instance':'String'},
//                    'nested.bField':{'path':'nested.bField','instance':'String'},
//                    'nested.twiceNested.nestedAField':{'path':'nested.twiceNested.nestedAField','instance':'String'},
//                    'nested.twiceNested.nestedBField':{'path':'nested.twiceNested.nestedBField','instance':'String'},
//                    'module':{'path':'module','instance':'String'} }
//            );
//            $httpBackend.whenGET('api/collection/51002970cfc2850222000005').respond({
//                '__v': 0, '_id': '51002970cfc2850222000005',
//                'name': 'John',
//                'nested': {
//                    'aField': 'A value',
//                    'bField': 'a different value',
//                    'twiceNested': {
//                        'nestedAField' : 'Romulus',
//                        'nestedBField' : 'Remus'
//                    }
//                },
//                'module': 'Some text or other'
//            });
//            $routeParams.model = 'collection';
//            $routeParams.id = '51002970cfc2850222000005';
//            scope = $rootScope.$new();
//            ctrl = $controller('BaseCtrl', {$scope: scope});
//
//            $httpBackend.flush();
//
//            dump(scope.formSchema)
//            elm = angular.element(
//               "<form name="myForm" class="form-horizontal compact">" +
//               "<form-input info="{\"name\": \"nested.twiceNested.nestedBField\",\"id\": \"f_nested.twiceNested.nestedBField\",\"label\": \"Nested.twicenested.nestedbfield\",\"type\": \"text\"}">
//                </form-input>" +
//               "</form>");
//
//            $compile(elm)(scope);
//            scope.$digest();
//
//        }));
//
//        iit('Puts nested fields in the correct input controls', function() {
//            dump(elm);
//            var label = elm.find('label');
//            expect(label.text()).toBe('Description');
//
//        });
//
//    });

