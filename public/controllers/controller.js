var app = angular.module('myApp', []);

// ======================================
// ==== User Factory ====================
// ======================================

app.factory('User', function($http){
    var User = {
        name: "ass"
    };

    // Get Profile Data - We can search for profile data using the express session middleware

    User.getProfileData = function(){
        $http.get('/profile/data').success(function(data){
            return data;
        });
    };

    // Set Profile Picture

    User.setProfilePicture = function(profilePic){
        $http.post('/profile/picture', profilePic).success(function(message){
            return message;
        });
    };

    return User;
});

// ======================================
// ==== Main Controller =================
// ======================================

app.controller('mainController', ['$scope', '$http', function($scope, $http) {
    $scope.test = "suck me ass";
}]);