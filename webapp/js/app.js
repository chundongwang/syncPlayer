var syncPlayerApp = angular.module('SyncPlayerApp', [ 'ngRoute', 'ngResource' ]).config([ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl : 'js/view/home.tpl.html',
    controller : 'HomeCtrl'
  }).when('/room', {
    templateUrl : 'js/view/room.tpl.html',
    controller : 'RoomCtrl'
  }).otherwise({
    redirectTo : '/home'
  });
} ]).config([ '$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      'responseError' : function(rejection) {
        if (rejection.status === 401) {
          window.location.href = rejection.headers().loginurl;
          return;
        }
        return rejection;
      }
    }
  });
} ]).controller('RootCtrl', [ '$scope', '$location', '$resource', '$window', function($scope, $location, $resource, $window) {
  $scope.path = $location.path();

  var auth = $resource('/auth', {}, {
    'get' : {
      method : 'GET',
      headers : {
        'X-continue-url' : $window.location.href
      }
    }
  }).get({}, function() {
    if (!!auth.user_email) {
      $scope.login = auth.user_email;
    } else if (!!auth.login_url) {
      window.location.href = auth.login_url;
    } else {
      // Impossible
    }
  })
  $scope.login = null;
} ]);