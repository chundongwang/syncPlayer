/**
 * Directive of Video Player
 * 
 * Because of the nature of the way to wire up to the YouTubeIframeAPIReady event, this directive doesn't support to appear multiple times in one AngularJS App.
 */
// YouTubeAPI will callback to this global function. This function will be initialized when linking the directive
var onYouTubeIframeAPIReady;
syncPlayerApp.directive('spPlayer', [ '$resource', function($resource) {
  return {
    restrict : 'E',
    scope : {
      room : '='
    },
    template : '<div id="player"></div>',
    link : function(scope, elem) {
      var LATENCY_TOLERANT = 3; //in sec
      var INTERVAL = LATENCY_TOLERANT * 1000; //in msec

      onYouTubeIframeAPIReady = function abc() {
        createPlayer();
      };

      scope.$watch('room.name', function(newVal, oldVal) {
        if (!newVal) return;

        createPlayer();
      });

      function isCreator() {
        // TODO
        return false;
      }

      function createPlayer() {
        var shouldIgnoreEvent = false;
        if ($('iframe#player').length > 0)
          return; //TODO: Make sure this works.

        var roundtrip = 0;
        var prepareRoundTrip = $resource('/roundtrip').get(function() {
          var server_timestamp = prepareRoundTrip.server_timestamp;
          var roundtripResult = $resource('/roundtrip/' + server_timestamp).get(function() {
            roundtrip = roundtripResult.roundtrip;
          });
        });

        function pushToSync(state, thePlayer) {
          var time = thePlayer.getCurrentTime(); //Get the time asap.
          if (shouldIgnoreEvent) {
            shouldIgnoreEvent = false;
            return;
          }
          if (!isCreator()) {
            return;
          }
          $resource('/room/:name/video/:video', {
            name : scope.room.name,
            video : scope.room.video_ids[0]
          }, {
            'update' : {method : 'PUT'}
          }).update({
            op : state,
            current_time : time,
            roundtrip : roundtrip
          });
        }
        
        function polling() {
          var room = $resource('/room/:name').get({name : scope.room.name}, function() {
            onRoomChange(room);
            setTimeout(polling, INTERVAL);
          });
        }
        
        function onRoomChange(room) {
          if (Math.abs(room.current_time - player.getCurrentTime()) > LATENCY_TOLERANT) {
            changeByRoomCurrentTime(room.current_time);
          }
          if (room.state != scope.room.state) {
            changeByRoomState(room.state);
          }
          scope.room = room;
        }
        
        function changeByRoomCurrentTime(time) {
          player.seekTo(time);
        }
        
        function changeByRoomState(state) {
          shouldIgnoreEvent = true;
          switch (state) {
            case 'NOTSTARTED':
              break;
            case 'PAUSED':
              player.pauseVideo();
              break;
            case 'PLAYING':
              player.playVideo(); // We use a flag to assure that this playVideo operation will not trigger pushToSync.
              break;
          }
        }

        var player = new YT.Player('player', {
          height : 390,
          width : 640,
          playerVars : isCreator() ? {} : {
            controls : 0
          },
          events : {
            'onReady' : function(event) {
              if (scope.room.video_ids.length > 0) {
                player.cueVideoById(scope.room.video_ids[0], scope.room.current_time + roundtrip/2);
              }
            },
            'onStateChange' : function(event) {
              switch (event.data) {
                case YT.PlayerState.CUED:
                  changeByRoomState(scope.room.state);
                  if (!isCreator()) {
                    polling();
                  }
                  break;
                case YT.PlayerState.PLAYING:
                    pushToSync('PLAYING', event.target);
                  break;
                case YT.PlayerState.PAUSED:
                    pushToSync('PAUSED', event.target);
                  break;
              }
            },
            'onError' : function(event) {
              // TODO: how to handle error?
              console.log('[' + player.getCurrentTime() + '] ' + event.data);
            }
          }
        // events
        });
      }// createPlayer
    }// link
  };
} ]);