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

      onYouTubeIframeAPIReady = function abc() {
        createPlayer();
      };

      scope.$watch('room', function(newVal, oldVal) {
        if (!newVal) return;

        createPlayer();
      });

      function isCreator() {
        // TODO
        return true;
      }

      function createPlayer() {
        var shouldIgnoreEvent = false;
        if (elem.find('iframe#player').length > 0)
          return; //TODO: Make sure this works.

        var roundtrip = 0;
        var prepareRoundTrip = $resource('/roundtrip').get(function() {
          server_timestamp = prepareRoundTrip.server_timestamp;
          roundtripResult = $resource('/roundtrip/' + server_timestamp).get(function() {
            roundtrip = roundtripResult.roundtrip;
          });

        });

        function showMessage(msg) {
          console.log('[' + player.getCurrentTime() + '] ' + msg);
        }

        function pushToSync(state, thePlayer) {
          var time = thePlayer.getCurrentTime();
          if (shouldIgnoreEvent) {
            showIgnoreEvent = false;
            return;
          }
          $resource('/room/:name/video/:video', {
            name : scope.room.name,
            video : scope.room.video_ids[0]
          }, {
            'update' : {
              method : 'PUT'
            }
          }).update({
            op : state,
            current_time : time,
            roundtrip : roundtrip
          });
        }

        function playVideo(toIgnoreEvent) {
          shouldIgnoreEvent = toIgnoreEvent;
          player.playVideo();
        }

        var player = new YT.Player('player', {
          height : 390,
          width : 640,
          playerVars : isCreator ? {} : {
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
                  switch (scope.room.state) {
                    case 'NOTSTARTED':
                      break;
                    case 'PAUSED':
                      break;
                    case 'PLAYING':
                      playVideo(true); // We use a flag to assure that this playVideo operation will not trigger pushToSync.
                      break;
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
              showMessage('Error: ' + event.data);
            }
          }
        // events
        });
      }// createPlayer
    }// link
  };
} ]);