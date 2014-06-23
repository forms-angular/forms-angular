'use strict';
formsAngular.controller('FriendCtrl', ['$scope', '$routeParams', '$location', '$http', function ($scope, $routeParams, $location, $http) {
  $scope.frdShowAdd = false;
  $scope.frdNewFriend = {};
  $scope.frdHideDetails = function () {
    $scope.frdPopupName = 'Move mouse over a friend';
    $scope.frdPopupPhone = 'to see their details';
  };

  $scope.frdShowDetails = function (friend) {
    $http.get('/api/a_unadorned_mongoose/' + friend.friend).success(function (data) {
      if (data && data.success !== false) {
        $scope.frdPopupName = data.forename + ' ' + data.surname;
        $scope.frdPopupPhone = data.phone;
      } else {
        $scope.frdPopupName = 'This friend does not exist - someone may have deleted the record';
      }
    }).error(function () {
      $scope.frdPopupName = 'Error reading friend details';
      $scope.frdPopupPhone = 'Please try again';
    });
  };

  $scope.frdRemoveFriend = function (friend) {
    for (var i = 0; i < $scope.record.friendList.length; i++) {
      if ($scope.record.friendList[i].friend === friend.friend) {
        $scope.record.friendList.splice(i, 1);
        break;
      }
    }
  };

  $scope.frdShowAddForm = function () {
    $scope.frdShowAdd = true;
    $scope.frdNewFriend = {};
  };

  $scope.frdSaveFriend = function () {
    var theFriend = angular.copy($scope.frdNewFriend.friendList);
    delete theFriend.friend;
    theFriend.friend = $scope.frdNewFriend.friendList.friend.id;
    $scope.record.friendList.push(theFriend);
    $scope.frdShowAdd = false;
  };

  $scope.frdHideDetails();

}]).directive('friends', function () {
  return {
    restrict: 'E',
    replace: true,
    priority: 1,
    controller: 'FriendCtrl',
    templateUrl: 'test/template/friends.html'
  };
});
