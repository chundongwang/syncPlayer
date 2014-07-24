var room_full_param = {
  name : "ROOM_TEST_FULLNAME",
  cover : "ROOM_TEST_FULLNAME_COVER",
  current_time : 0    
};
var room_name_only = {
  name : "ROOM_TEST_NAME"
};
var roundtrip_time = null;
var play_time = 100;
var pause_time = 200;

QUnit.config.reorder = false;
QUnit.config.deferred_interval = 200;

QUnit.module( "room with full parameters", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_full_param, "full parameters");
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_full_param, "full parameters");
  }
});
QUnit.asyncTest( "full parameters", function( assert ) {
  expect( 4 ); 
  QUnit.start();
});

QUnit.module( "room with name only", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_name_only, "name only");
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_name_only, "name only");
  }
});
QUnit.asyncTest( "name only", function( assert ) {
  expect( 4 ); 
  QUnit.start();
});

QUnit.module( "room list", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_name_only);
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_name_only);
  }
});
QUnit.asyncTest( "get room list", function( assert ) {
  expect( 1 ); 
  $.ajax({
    type: "GET",
    url: "/room",
    //async: false,
  })
  .done(function(data){
    QUnit.assert.ok(data.length>0, "The count of room list should be more than zero.");
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});

QUnit.module( "round trip" );
QUnit.asyncTest( "get round trip", function( assert ) {
  expect( 1 ); 
  $.ajax({
    type: "GET",
    url: "/roundtrip",
    //async: false,
  })
  .done(function(data){
    QUnit.assert.ok(data.server_timestamp>0, "The server_timestamp of roundtrip should be more than zero and is: "+data.server_timestamp);
    roundtrip_time = data.server_timestamp;
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});
QUnit.asyncTest( "send round trip", function( assert ) {
  expect( 1 ); 
  $.ajax({
    type: "GET",
    url: "/roundtrip/"+roundtrip_time,
    //async: false,
  })
  .done(function(data){
    QUnit.assert.ok(data.roundtrip>0, "The actual value of roundtrip should be more than zero and is: "+data.roundtrip);
    roundtrip_time = data.roundtrip;
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});

QUnit.module( "play-pause-current", {
  setup: function() {
    // prepare something for all following tests
    create_room_QUnit_helper(room_name_only);
  },
  teardown: function() {
    // clean up after each test
    delete_room_QUnit_helper(room_name_only);
  }
});
QUnit.asyncTest( "current_time before play", function( assert ) {
  expect( 1 ); 
  $.ajax({
    type: "GET",
    url: "/current_time/"+room_name_only.name,
    //async: false,
  })
  .done(function(data){
    QUnit.assert.equal(data.current_time,0, "current_time should be zero before play.");
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
});
QUnit.asyncTest( "play", function( assert ) {
  expect( 2 ); 
  $.ajax({
    type: "GET",
    url: "/play/"+room_name_only.name+"/"+play_time,
    //async: false,
  })
  .done(function(data){
    QUnit.assert.equal(data.result,"SUCCEED", "Operation play of room should work.");
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/current_time/"+room_name_only.name,
        //async: false,
      })
      .done(function(data){
        QUnit.assert.equal(data.current_time,play_time, "current_time should be play_time after play.");
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
});
QUnit.asyncTest( "pause", function( assert ) {
  expect( 2 ); 
  $.ajax({
    type: "GET",
    url: "/pause/"+room_name_only.name+"/"+pause_time,
    //async: false,
  })
  .done(function(data){
    QUnit.assert.equal(data.result,"SUCCEED", "Operation play of room should work.");
    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: "/current_time/"+room_name_only.name,
        //async: false,
      })
      .done(function(data){
        QUnit.assert.equal(data.current_time,pause_time, "current_time should be pause_time after pause.");
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
});
