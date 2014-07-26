'use strict';

syncPlayerApp.controller('HomeCtrl', ['$scope', '$location', '$resource', '$window', function($scope, $location, $resource, $window) {
  $scope.loading = true;
  updateAll();
  
  $scope.gotoRoom = function(room) {
    $location.path('/room').search({
      name : room.name
    });
  }
  
  $scope.tryCreateRoom = function() {
//    if (!!$scope.login) {
      $('#newRoomDialog').modal('show');
//    } else {
//      $window.location.href = '/_ah/login?continue=/';
//    }
  }

  $scope.onNewRoomCompleted = $scope.gotoRoom;
  
  function updateAll() {
    var rooms = $resource('/room').query(function(){
      $scope.loading = false;

      $scope.rooms = rooms;
    });
  }

}]);
