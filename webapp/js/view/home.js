'use strict';

syncPlayerApp.controller('HomeCtrl', ['$scope', '$location', 'roomService', function($scope, $location, roomService) {
  $scope.loading = true;


  
  $scope.getRoomUrl = function(name) {
    return '/room?name='+encodeURI(name);
  };
  
  (function updateAll() {

    var rooms = roomService.query(function(){
      $scope.loading = false;

      $scope.rooms = rooms;
    });

  })();

}]);
