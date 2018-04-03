'use strict';

websiteApp.controller('FriendCtrl', ['$scope', '$routeParams', '$location', '$http', function ($scope, $routeParams, $location, $http) {

  $scope.frdShowAdd = false;
  $scope.frdNewFriend = {};
  $scope.selectedFriend = null;

  $scope.frdHideDetails = function () {
    if ($scope.record.friendList && $scope.record.friendList.length > 0) {
      $scope.frdPopupName = 'Move mouse over a friend';
      $scope.frdPopupComments = 'to see their details';
    } else {
      if ($scope.record.surname) {
        $scope.frdPopupName = ($scope.record.forename || '') + ' ' + $scope.record.surname + ' is Norman No Mates!';
      } else {
        $scope.frdPopupName = '';
      }
      $scope.frdPopupComments = 'Click on the button ---> to add a friend';
    }
  };

  $scope.$on('fngCancel', function() {
    if (!_.find($scope.record.friendList, function(friend) {
        return friend.friend === $scope.selectedFriend;
      })) {
      $scope.selectedFriend = null;
      $scope.frdHideDetails();
    }
  });

  $scope.showFriendDetails = function (friend) {
    $http.get('/api/a_unadorned_schema/' + $scope.textToId(friend.friend), {cache: true}).then(function (response) {
      var data = response.data;
      if (data && data.success !== false) {
        $scope.selectedFriend = friend;
        $scope.frdPopupName = data.forename + ' ' + data.surname;
        $scope.frdPopupComments = friend.comment;
      } else {
        $scope.frdPopupName = 'This friend does not exist - someone may have deleted the record';
      }
    }).error(function () {
      $scope.popupName = 'Error reading friend details';
      $scope.popupComments = 'Please try again';
    });
  };

  $scope.frdRemoveFriend = function (index) {
    $scope.selectedFriend = null;
    $scope.frdHideDetails();
    $scope.record.friendList.splice(index, 1);
    $scope.baseForm.$setDirty();
  };

  $scope.selectedClass = function (friend) {
    return (friend === $scope.selectedFriend ? 'selectedFriend' : '');
  };


  $scope.frdShowAddForm = function () {
    $scope.frdShowAdd = true;
    $scope.frdNewFriend = {};
  };

  $scope.textToId = function (text) {
    /*jshint camelcase: false */
    return $scope.f_friendList_friend_ids[$scope.f_friendList_friendOptions.indexOf(text)];
    /*jshint camelcase: true */
  };

  $scope.frdSaveFriend = function () {
    $scope.record.friendList = $scope.record.friendList || [];
    $scope.record.friendList.push($scope.newFriend.friendList);
    $scope.selectedFriend = $scope.newFriend.friendList;
    $scope.frdShowAdd = false;
    $scope.newFriend = {};
    $scope.baseForm.$setDirty();
  };

  $scope.frdHideDetails();

}]).directive('friends', function () {
  return {
    restrict: 'E',
    replace: true,
    priority: 1,
    controller: 'FriendCtrl',
    templateUrl: 'scripts/template/friends.html'
  };
});

