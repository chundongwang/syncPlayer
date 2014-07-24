'use strict';

syncPlayerApp.factory('roomService', ['$resource', function($resource) {
  return $resource('/room/:name', null, {});
}]);