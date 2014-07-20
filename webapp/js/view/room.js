//'use strict';

syncPlayerApp.controller('RoomCtrl', [ '$scope', '$location', 'roomService', function($scope, $location, roomService) {
  $scope.loading = true;
  (function updateAll() {
    
    var room = roomService.get({name: $location.search()['name']}, function(){
      $scope.loading = false;
      $scope.room = room;
    });

  })();

} ]);

