'use strict';

syncPlayerApp.controller('HomeCtrl', ['$scope', '$location', 'roomService', function($scope, $location, roomService) {
  $scope.loading = true;

  $scope.tryCreateRoom = function() {
    // TODO: newRoomName must be valid
    var newRoom = roomService.save({name: $scope.newRoomName}, function() {
      // Successfully create room and redirect to it.
      if (newRoom.result === 'SUCCEED') {
        $location.path('/room').search({name: $scope.newRoomName});
      }
      // TODO: Handle error cases
    });
  };
  
  $scope.getRoomUrl = function(name) {
    return '/room?name='+encodeURI(name);
  };
  
  (function updateAll() {
    $scope.loading = false;

    var rooms = roomService.query(function(){
      $scope.rooms = rooms;
    });

  })();

}]);  