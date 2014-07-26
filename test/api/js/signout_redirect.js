/**
 * Redirect to Sign-out and redirect back
 */
if (!!$.cookie("dev_appserver_login")) {
  var url = "/_ah/login?email=test@amazon.com&action=Logout&continue=" + encodeURI(document.location);
  document.location = url;
}