/**
 * Redirect to Sign-in and redirect back
 */
 if (!$.cookie("dev_appserver_login")) {
  var url = "/_ah/login?email=test@amazon.com&action=Login&continue=" + encodeURI(document.location);
  document.location = url;
}