'use strict';

syncPlayerApp.controller('HomeCtrl', ['$scope', '$location', '$resource', function($scope, $location, $resource) {
  $scope.loading = true;
  updateAll();
  
  $scope.gotoRoom = function(room) {
    $location.path('/room').search({
      name : room.name
    });
  }

  $scope.onNewRoomCompleted = $scope.gotoRoom;
  
  function updateAll() {
    var rooms = $resource('/room').query(function(){
      $scope.loading = false;

      $scope.rooms = rooms;
    });
  }

}]);
