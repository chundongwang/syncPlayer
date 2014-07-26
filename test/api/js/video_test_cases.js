var room_info = {
  name : "VIDEO_TEST_ROOMNAME"
};
var video_info_1 = {
  id : "VIDEO_TEST_VIDEOID_1"
}
var video_info_2 = {
  id : "VIDEO_TEST_VIDEOID_2"
}
var fake_roundtrip_time = 10;
var play_time = 100;
var play_pending_duration = 3; // in second like play time and pause time
var pause_time = 200;

QUnit.module( "video add/remove", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_info);
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_info);
  }
});
QUnit.asyncTest( "Add videos", function( assert ) {
  expect( 6 ); 
  $.ajax({
    type: "POST",
    url: "/room/"+room_info.name+"/video",
    //async: false,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(video_info_1)
  })
  .done(function(data){
    QUnit.assert.equal(data.result,"SUCCEED", "Add video to an existing room should work.");
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/room/"+room_info.name+"/video",
        //async: false,
      })
      .done(function(data){
        QUnit.assert.ok(data.length>0, "After adding a video to an existing room, video list returned should be non-empty.");
        QUnit.assert.equal(data[data.length-1], video_info_1.id, "After adding a video to an existing room, last video id should be the one we post.");
        setTimeout(function() {
          $.ajax({
            type: "POST",
            url: "/room/"+room_info.name+"/video",
            //async: false,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(video_info_2)
          })
          .done(function(data){
            QUnit.assert.equal(data.result,"SUCCEED", "Add another video to an existing room should work.");
            setTimeout(function() {
              $.ajax({
                type: "GET",
                url: "/room/"+room_info.name+"/video",
                //async: false,
              })
              .done(function(data){
                QUnit.assert.ok(data.length>0, "After adding another video to an existing room, video list returned should be non-empty.");
                QUnit.assert.equal(data[data.length-1], video_info_2.id, "After adding another video to an existing room, last video id should be the one we post.");
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              })
              .fail(function(){
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              });
            }, QUnit.config.deferred_interval );
          })
          .fail(function(){
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          }) 
        }, QUnit.config.deferred_interval );
      })
      .fail(function(){
        setTimeout(function() {
          QUnit.start();
        }, QUnit.config.deferred_interval );
      });
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});

QUnit.asyncTest( "Delete video", function( assert ) {
  expect( 5 ); 
  $.ajax({
    type: "POST",
    url: "/room/"+room_info.name+"/video",
    //async: false,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(video_info_1)
  })
  .done(function(data){
    QUnit.assert.equal(data.result,"SUCCEED", "Add video to an existing room should work.");
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/room/"+room_info.name+"/video",
        //async: false,
      })
      .done(function(data){
        var to_delete_index = data.length-1;
        QUnit.assert.ok(data.length>0, "After adding a video to an existing room, video list returned should be non-empty.");
        QUnit.assert.equal(data[data.length-1], video_info_1.id, "After adding a video to an existing room, last video id should be the one we post.");
        setTimeout(function() {
          $.ajax({
            type: "DELETE",
            url: "/room/"+room_info.name+"/video/"+to_delete_index,
            //async: false,
          })
          .done(function(data){
            QUnit.assert.equal(data.result,"SUCCEED", "Delete an existing video of an existing room should work.");
            setTimeout(function() {
              $.ajax({
                type: "GET",
                url: "/room/"+room_info.name+"/video",
                //async: false,
              })
              .done(function(data){
                QUnit.assert.ok(data.length==0, "After deleted the video of an existing room, video list returned should be non-empty.");
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              })
              .fail(function(){
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              });
            }, QUnit.config.deferred_interval );
          })
          .fail(function(){
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          }) 
        }, QUnit.config.deferred_interval );
      })
      .fail(function(){
        setTimeout(function() {
          QUnit.start();
        }, QUnit.config.deferred_interval );
      });
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});

QUnit.module( "video manipulation", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_info);
    addvideo_QUnit_helper(room_info, video_info_1);
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_info);
  }
});
QUnit.asyncTest( "Play video with fake roundtrip", function( assert ) {
  expect( 5 ); 
  var play_time_info = {op:"PLAYING", current_time:play_time, roundtrip:fake_roundtrip_time};
  $.ajax({
    type: "PUT",
    url: "/room/"+room_info.name+"/video/"+video_info_1.id,
    //async: false,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(play_time_info)
  })
  .done(function(data){
    QUnit.assert.equal(data.result, "SUCCEED", "Play video should work.");
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/room/"+room_info.name,
        //async: false,
      })
      .done(function(data){
          QUnit.assert.equal(data.name, room_info.name, "The name of the room should be the name we specified.");
          QUnit.assert.equal(data.state, play_time_info.op, "The state of the room should be the op we specified.");
        setTimeout(function() {
          $.ajax({
            type: "GET",
            url: "/room/"+room_info.name+"/current_time",
            //async: false,
          })
          .done(function(data){
            QUnit.assert.ok(data.current_time>=play_time+fake_roundtrip_time/2.0+play_pending_duration, 
              "The current time should be the room should be as expected: "+(play_time+fake_roundtrip_time/2.0+play_pending_duration));
            QUnit.assert.ok(data.current_time<=play_time+fake_roundtrip_time/2.0+play_pending_duration+1.5, 
              "The current time should be the room should be as expected.");
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          })
          .fail(function(){
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          }) 
        }, /*Pretend real playing*/play_pending_duration*1000 );
      })
      .fail(function(){
        setTimeout(function() {
          QUnit.start();
        }, QUnit.config.deferred_interval );
      }) 
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});
QUnit.asyncTest( "Play video with real roundtrip", function( assert ) {
  expect( 7 ); 
  $.ajax({
    type: "GET",
    url: "/roundtrip",
    //async: false,
  })
  .done(function(data){
    var server_timestamp = data.server_timestamp;
    QUnit.assert.ok(data.server_timestamp>0, "The server_timestamp of roundtrip should be more than zero and is: "+data.server_timestamp);
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/roundtrip/"+server_timestamp,
        //async: false,
      })
      .done(function(data){
        var roundtrip_time = data.roundtrip;
        QUnit.assert.ok(data.roundtrip>0, "The actual value of roundtrip should be more than zero and is: "+data.roundtrip);
        setTimeout(function() {
          var play_time_info = {op:"PLAYING", current_time:play_time, roundtrip:roundtrip_time};
          $.ajax({
            type: "PUT",
            url: "/room/"+room_info.name+"/video/"+video_info_1.id,
            //async: false,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(play_time_info)
          })
          .done(function(data){
            QUnit.assert.equal(data.result, "SUCCEED", "Play video should work.");
            setTimeout(function() {
              $.ajax({
                type: "GET",
                url: "/room/"+room_info.name,
                //async: false,
              })
              .done(function(data){
                  QUnit.assert.equal(data.name, room_info.name, "The name of the room should be the name we specified.");
                  QUnit.assert.equal(data.state, play_time_info.op, "The state of the room should be the op we specified.");
                setTimeout(function() {
                  $.ajax({
                    type: "GET",
                    url: "/room/"+room_info.name+"/current_time",
                    //async: false,
                  })
                  .done(function(data){
                    QUnit.assert.ok(data.current_time>=play_time, 
                      "The current time should be the room should be the one we set.");
                    QUnit.assert.ok(data.current_time<=play_time+roundtrip_time/2.0+1.5, 
                      "The current time should be the room should be the one we set.");
                    setTimeout(function() {
                      QUnit.start();
                    }, QUnit.config.deferred_interval );
                  })
                  .fail(function(){
                    setTimeout(function() {
                      QUnit.start();
                    }, QUnit.config.deferred_interval );
                  }) 
                }, QUnit.config.deferred_interval );
              })
              .fail(function(){
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              }) 
            }, QUnit.config.deferred_interval );
          })
          .fail(function(){
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          }) 
        }, QUnit.config.deferred_interval );
      })
      .fail(function(){
        setTimeout(function() {
          QUnit.start();
        }, QUnit.config.deferred_interval );
      }) 
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});
QUnit.asyncTest( "Pause video with real roundtrip", function( assert ) {
  expect( 7 ); 
  $.ajax({
    type: "GET",
    url: "/roundtrip",
    //async: false,
  })
  .done(function(data){
    var server_timestamp = data.server_timestamp;
    QUnit.assert.ok(data.server_timestamp>0, "The server_timestamp of roundtrip should be more than zero and is: "+data.server_timestamp);
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/roundtrip/"+server_timestamp,
        //async: false,
      })
      .done(function(data){
        var roundtrip_time = data.roundtrip;
        QUnit.assert.ok(data.roundtrip>0, "The actual value of roundtrip should be more than zero and is: "+data.roundtrip);
        setTimeout(function() {
          var pause_time_info = {op:"PAUSED", current_time:pause_time, roundtrip:roundtrip_time};
          $.ajax({
            type: "PUT",
            url: "/room/"+room_info.name+"/video/"+video_info_1.id,
            //async: false,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(pause_time_info)
          })
          .done(function(data){
            QUnit.assert.equal(data.result, "SUCCEED", "Pause video should work.");
            setTimeout(function() {
              $.ajax({
                type: "GET",
                url: "/room/"+room_info.name,
                //async: false,
              })
              .done(function(data){
                  QUnit.assert.equal(data.name, room_info.name, "The name of the room should be the name we specified.");
                  QUnit.assert.equal(data.state, pause_time_info.op, "The state of the room should be the op we specified.");
                setTimeout(function() {
                  $.ajax({
                    type: "GET",
                    url: "/room/"+room_info.name+"/current_time",
                    //async: false,
                  })
                  .done(function(data){
                    QUnit.assert.ok(data.current_time>=pause_time, 
                      "The current time should be the room should be the one we set.");
                    QUnit.assert.ok(data.current_time<=pause_time+roundtrip_time/2.0+0.5, 
                      "The current time should be the room should be the one we set.");
                    setTimeout(function() {
                      QUnit.start();
                    }, QUnit.config.deferred_interval );
                  })
                  .fail(function(){
                    setTimeout(function() {
                      QUnit.start();
                    }, QUnit.config.deferred_interval );
                  }) 
                }, QUnit.config.deferred_interval );
              })
              .fail(function(){
                setTimeout(function() {
                  QUnit.start();
                }, QUnit.config.deferred_interval );
              }) 
            }, QUnit.config.deferred_interval );
          })
          .fail(function(){
            setTimeout(function() {
              QUnit.start();
            }, QUnit.config.deferred_interval );
          }) 
        }, QUnit.config.deferred_interval );
      })
      .fail(function(){
        setTimeout(function() {
          QUnit.start();
        }, QUnit.config.deferred_interval );
      }) 
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});