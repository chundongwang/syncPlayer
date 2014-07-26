function delete_cookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

QUnit.module( "Not logged in", {
  setup: function() {
    // prepare something for all following tests
  },
  teardown: function() {
    // clean up after each test
  }
});
QUnit.asyncTest( "Get identity", function( assert ) {
  expect( 2 ); 
  $.ajax({
    type: "GET",
    url: "/auth",
    //async: false,
    headers: {"X-continue-url":"HTTP://AUTHENTICATION-URL-TEST"}
  })
  .done(function(data){
    QUnit.assert.ok(!!data.login_url, "login_url should be supplied if not currently logged in.");
    QUnit.assert.ok(data.login_url.indexOf('AUTHENTICATION-URL-TEST')>=0, "login_url should be contain what we provided through X-continue-url.");
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  })
  .fail(function(){
    setTimeout(function() {
      QUnit.start();
    }, QUnit.config.deferred_interval );
  });
});