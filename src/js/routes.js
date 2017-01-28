/* global angular */
var app = angular.module('app');
// Enrutamientos
app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl :'views/contenido.html'
        }).when('/:pagina', {
            templateUrl :'views/contenido.html'
        }).otherwise({
            redirectTo: '/'
        });
}]);