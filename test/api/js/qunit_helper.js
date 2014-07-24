function create_room_QUnit_helper(room_spec, spec_desc) {
  QUnit.stop();
  $.ajax({
    type: "POST",
    url: "/room",
    //async: false,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(room_spec)
  })
  .done(function(data){
    if (!!spec_desc) {
      QUnit.assert.equal(data.result,"SUCCEED", "The ajax of create_room with "+spec_desc+" should work but failed with: "+(data.reason||"<unknown>"));
      QUnit.assert.ok(data.data, "The ajax of create_room with "+spec_desc+" should return room info but now: "+(data.data||"<null>"));
      if (data.data) {
        QUnit.assert.equal(data.data.name,room_spec.name, "The ajax of create_room with "+spec_desc+" should return room info but with wrong room name: "+(data.data.name||"<unknown>"));
      }
    }
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }) 
}
function delete_room_QUnit_helper(room_spec, spec_desc) {
  QUnit.stop();
  $.ajax({
    type: "DELETE",
    url: "/room/"+room_spec.name,
    //async: false,
  })
  .done(function(data){
    if (!!spec_desc) {
      QUnit.assert.equal(data.result,"SUCCEED", "The ajax of delete_room after create_room with "+spec_desc+" should work but failed with: "+(data.reason||"<unknown>"));
    }
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  }); 
}