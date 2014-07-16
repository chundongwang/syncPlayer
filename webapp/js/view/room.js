//'use strict';

syncPlayerApp.controller('RoomCtrl', [ '$scope', function($scope) {

  //TODO: Need to fix this. The code here only runs when the controller initialization the very first time.
  // I need to move the video construction into directive.
  
  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

} ]);
var player;

function log(msg) {
  $('log').innerHTML += msg + "<br>";
}
// 3. This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height : '390',
    width : '640',
    // videoId: 'M7lc1UVf-VE',
    events : {
      'onReady' : onPlayerReady,
      'onStateChange' : onPlayerStateChange,
      'onError' : onPlayerError
    }
  });
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.cueVideoById('QSKU4UURRAU');
  // player.cueVideoById('m-a8QMqp2nM');
}

// 5. The API calls this function when the player's state changes.
// The function indicates that when playing a video (state=1),
// the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.CUED) {
    setTimeout(seekVideo, 6000);
    event.target.playVideo();
  } else if (event.data == YT.PlayerState.PLAYING) {
    log("PLAYING at: " + event.target.getCurrentTime());
  } else if (event.data == YT.PlayerState.PAUSED) {
    log("PAUSED at: " + event.target.getCurrentTime());
  }
}
function onPlayerError(event) {
  alert('event code:' + event.data);
}
function seekVideo() {
  player.seekTo(12, true);
  // setTimeout(stopVideo, 3000);
}
function stopVideo() {
  player.stopVideo();
}