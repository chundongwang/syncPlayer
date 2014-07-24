/**
 * Directive of Video Player
 */
'use strict';

syncPlayerApp.directive('newRoomDialog', [ '$resource', '$location', function($resource, $location) {
  return {
    restrict : 'E',
    scope : {},
    templateUrl : '/js/dir/new-room-dialog.tpl.html',
    link : function(scope, elem) {
      reset();

      function reset() {
        scope.room = {
          name : '',
          video : ''
        };
      }
      /**
       * The method creates a new room and update with the video id. TODO: Handle error cases
       */
      scope.tryCreateRoom = function() {
        var newRoom = $resource('/room').save(scope.room, function() {
          // Creating room succeeded so we update with the video id
          if (newRoom.result === 'SUCCEED') {
            setTimeout(function() {
              var theRoom = $resource('/room/:name/video', {
                name : scope.room.name
              }).save({
                id : scope.room.video
              }, function() {
                if (theRoom.result === 'SUCCEED') {
                  $location.path('/room').search({
                    name : scope.room.name
                  });
                  reset();
                }
              });
            }, 200);
          } else {
            // TODO: Change this to info tooltip
            alert('Room already exists. Try something else.');
          }
        });
      };
    }

  };
} ]);