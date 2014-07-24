var room_info = {
  name : "VIDEO_TEST_ROOMNAME"
};
var video_info_1 = {
  id : "VIDEO_TEST_VIDEOID_1"
}
var video_info_2 = {
  id : "VIDEO_TEST_VIDEOID_2"
}
var roundtrip_time = null;
var play_time = 100;
var pause_time = 200;

QUnit.config.reorder = false;
QUnit.config.deferred_interval = 200;

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