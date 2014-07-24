var syncPlayerApp = angular.module('SyncPlayerApp', ['ngRoute', 'ngResource'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'js/view/home.tpl.html',
    controller: 'HomeCtrl'
  }).when('/room', {
    templateUrl: 'js/view/room.tpl.html',
    controller: 'RoomCtrl'
  }).otherwise({
    redirectTo: '/home'
  });
}])
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function(){
    return {
      'responseError': function(rejection) {
        if (rejection.status === 401) {
          window.location.href = rejection.headers().loginurl;
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