var syncPlayerApp = angular.module('SyncPlayerApp', ['ngRoute', 'ngResource']);

syncPlayerApp
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'js/view/home.tpl.html',
    controller: 'HomeCtrl'
  }).when('/room', {
    templateUrl: 'js/view/room.tpl.html',
    controller: 'RoomCtrl'
  }).otherwise({
    redirectTo: '/home'
  });
  
  // Inject sign-in interceptor
  $httpProvider.interceptors.push(function(){
    return {
      'responseError': function(rejection) {
        if (rejection.status === 401) {
          window.location.href = rejection.headers().loginurl;
          return;
        }
        if (rejection.status === 400) {
          window.location.href = '/';
          return;
        }
        return rejection;
      }
    }
  });
}])
.controller('RootCtrl', ['$scope', '$location', function($scope, $location) {
  $scope.path = $location.path();
}]);