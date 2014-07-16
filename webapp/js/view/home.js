'use strict';

syncPlayerApp.controller('HomeCtrl', ['$scope', function($scope) {
//  $scope.loaded = false;

  (function updateAll() {
//    Guesser.listAll(function(groups) {
//      $scope.loaded = true;
//      $scope.showEulaModal();
//      
//      // Retrieve bets if the user is logged in
//      if ($scope.loggedIn) {
//        $scope.packMyBets(groups);
//      }
    $scope.rooms = [
                    {"user_email": "test@amazon.com", "name": "Atlanta", "state": "NOTSTARTED", "current_time": 0, "cover": null, "created_date": 1405491957000, "user_id": "193108225196471041992", "video_ids": []},
                    {"user_email": "test@amazon.com", "name": "London"},
                    {"user_email": "test@amazon.com", "name": "Beijing"},
                    {"user_email": "test@amazon.com", "name": "Hongkong"},
                    {"user_email": "test@amazon.com", "name": "Tokyo"}
                    ];
//    });
  })();

}]);  