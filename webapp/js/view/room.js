'use strict';

syncPlayerApp.controller('RoomCtrl', [ '$scope', '$location', '$resource', function($scope, $location, $resource) {
  $scope.loading = true;
  updateAll();

  function updateAll() {
    var name = $location.search()['name'];
    var room = $resource('/room/:name').get({
      name : name
    }, function() {
      if (room.name === name) {
        $scope.loading = false;
        $scope.room = room;
      } else {
        $location.url('/home');
      }
    });

  }

} ]);
