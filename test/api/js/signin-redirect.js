/**
 * Redirect to Sign-in and redirect back
 */
if (document.cookie.indexOf("dev_appserver_login") < 0) {
  var url = "/_ah/login?email=test@amazon.com&action=Login&continue=" + encodeURI(document.location);
  document.location = url;
}