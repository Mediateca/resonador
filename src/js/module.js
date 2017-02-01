/* global angular firebase */
var config = {
    apiKey: "AIzaSyDxRiTUgTD_KKfaeeY0HfUU4iZVcndq3mg",
    authDomain: "resonador-82846.firebaseapp.com",
    databaseURL: "https://resonador-82846.firebaseio.com",
    storageBucket: "resonador-82846.appspot.com",
    messagingSenderId: "237677222662"
};
firebase.initializeApp(config);
var app = angular.module('app', [
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'firebase'
]);
// Controladores
app.controller('main', [function(){
    console.log('main');
}]);
app.controller('contenido', ['$firebaseAuth', '$location', function($firebaseAuth, $location){
    console.log('contenido');
    var ruta = $location.path();
    var rutaVista = 'views';
    var vista;
    switch (ruta) {
        case '/':
            vista = rutaVista+ruta+'inicio.html';
            break;
        default:
            vista = rutaVista+ruta+'.html';
    }
    console.log('location', vista);
    var raiz = this;
    var auth = $firebaseAuth();
    auth.$onAuthStateChanged(function(firebaseUser) {
        console.log('Cambiando estatus', firebaseUser);
        if (firebaseUser) {
            raiz.rutaHeader = 'assets/html/header.html';
            raiz.rutaSidenav = 'assets/html/sidenav.html';
            raiz.rutaCuerpo = vista;
        } else {
            raiz.rutaHeader = null;
            raiz.rutaSidenav = null;
            if (ruta != '/perdiClave' && ruta != '/registro') {
                raiz.rutaCuerpo = rutaVista+'/login.html';
            } else {
                raiz.rutaCuerpo = rutaVista+ruta+'.html';            }
        }
    });
}]);
app.controller('header',['$firebaseAuth', function($firebaseAuth){
    console.log('header');
    var raiz = this;
    var auth = $firebaseAuth();
    raiz.nombreUsuario = auth.$getAuth().email;
    console.log('usuario autenticado:',raiz.nombreUsuario);
    raiz.salir = function() {
        console.log('Cerrando sesión...');
        auth.$signOut();
    };
    raiz.abreMenu = function($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };
}]);
app.controller('sidenav', [function(){
    console.log('sidenav');
}]);
app.controller('login', ['$firebaseAuth', function($firebaseAuth){
    console.log('login');
    var raiz = this;
    var auth = $firebaseAuth();
    raiz.autenticar = function(){
        auth.$signInWithEmailAndPassword(raiz.usuario, raiz.clave).then(function(firebaseUser){
            console.log('Logueado como', firebaseUser.email);
        }).catch(function(error){
            console.log('Error', error);
        });
    };
}]);
app.controller('registro', [function(){
    console.log('registro');
    var raiz =  this;
    raiz.codigoValidado = false;
    raiz.validarCodigo = function(codigo){
        console.log('codigo',codigo);
        if (codigo == 'pepe') {
            raiz.codigoValidado = true;
        }
    };
    raiz.enterCodigo = function(tecla, codigo) {
        if (tecla.key == 'Enter') {
            raiz.validarCodigo(codigo);
        }  
    };
}]);