/**
 * Directive of Video Player
 */
      
// YouTubeAPI will callback to this global function. This function will be initialized when linking the directive
var onYouTubeIframeAPIReady; 
syncPlayerApp.directive('spPlayer', function() {
  return {
    restrict : 'E',
    scope : {
      room : '='
    },
    template : '<div id="player"></div><p class="lead" ng-model="log"></p>',
    link : function(scope, elem) {
      scope.player = null;

      onYouTubeIframeAPIReady = createPlayer;
      
      scope.$watch('room', function(newVal, oldVal){
        if (newVal === null) return;
        createPlayer();
      });
      function createPlayer() {
        if (elem.find('iframe#player').length > 0) return;

        scope.player = new YT.Player('player', {
          height : 390,
          width : 640,
          events : {
            'onReady' : function(event) {
              event.target.cueVideoById(scope.room.video_ids.length > 0 ? scope.room.video_ids[0] : 'QSKU4UURRAU');
            },
            'onStateChange' : function(event) {
              if (event.data == YT.PlayerState.CUED) {
//                setTimeout(seekVideo, 6000);
//                setTimeout(stopVideo, 10000);
                event.target.playVideo();
              } else if (event.data == YT.PlayerState.PLAYING) {
                //scope.log += "PLAYING at: " + event.target.getCurrentTime();
              } else if (event.data == YT.PlayerState.PAUSED) {
                //scope.log += "PAUSED at: " + event.target.getCurrentTime();
              }
            },
            'onError' : function(event) {
              //scope.log += 'event code:' + event.data;
            }
          }
        });
      };
//      function seekVideo() {
//        scope.player.seekTo(12, true);
//      }
//      function stopVideo() {
//        scope.player.stopVideo();
//      }

    }
  };
});