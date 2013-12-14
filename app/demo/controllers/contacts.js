myDemoApp.controller('ContactCtrl',['$scope', '$routeParams', '$location', '$http', function($scope, $routeParams, $location, $http) {

    $scope.showAdd = false;
    $scope.newContact = {};
    $scope.hideDetails = function() {
        $scope.popupName = 'Move mouse over a contact';
        $scope.popupPhone = 'to see their details';
    };

    $scope.showDetails = function (contact) {
        $http.get('api/a_unadorned_mongoose/' + contact.contact).success(function (data) {
            if (data && data.success != false) {
                $scope.popupName = data.forename + ' ' + data.surname;
                $scope.popupPhone = data.phone;
            } else {
                $scope.popupName = 'This contact does not exist';
                $scope.popupPhone = 'Please contact your support provider';
            }
        }).error(function () {
                $scope.popupName = 'Error reading contact details';
                $scope.popupPhone = 'Please try again';
            });
    };

    $scope.removeContact = function(contact) {
        for (var i = 0; i < $scope.record.contactList.length; i++) {
            if ($scope.record.contactList[i].contact == contact.contact) {
                $scope.record.contactList.splice(i,1);
                break;
            }
        }
    };

    $scope.showAddForm = function() {
        $scope.showAdd=true;
        $scope.newContact = {};
    };

    $scope.saveContact = function() {
        var theContact = angular.copy($scope.newContact.contactList);
        delete theContact.contact;
        theContact.contact = $scope.newContact.contactList.contact.id;
        $scope.record.contactList.push(theContact);
        $scope.showAdd=false;
    };

    $scope.isContactSaveDisabled = function() {
        return $scope.newContactForm.$invalid; // || angular.equals(master, $scope.record);
    };

    $scope.hideDetails();

    for (var i = 0; i < $scope.formSchema.length; i++) {
        if ($scope.formSchema[i].directive === 'contacts') {
            $scope.contactSchema = $scope.formSchema[i].schema;
        }
    }

}]);


