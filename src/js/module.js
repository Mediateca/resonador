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
    'firebase',
    'ngclipboard',
    'material.components.expansionPanels',
    'ngFileUpload'
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
            break;
    }
    var raiz = this;
    var auth = $firebaseAuth();
    auth.$onAuthStateChanged(function(firebaseUser) {
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
                raiz.rutaCuerpo = rutaVista+ruta+'.html';
            }
        }
    });
}]);
app.controller('header',['$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','$rootScope', function($firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,$rootScope){
    console.log('header');
    var raiz = this;
    raiz.auth = $firebaseAuth();
    var usuarioAutenticado = raiz.auth.$getAuth();
    var listaUsuarios = $firebaseArray(firebase.database().ref('usuarios'));
    listaUsuarios.$loaded().then(function(ref){
        angular.forEach(listaUsuarios, function(valor, llave){
            if(valor.email == usuarioAutenticado.email) {
                raiz.usuario = $firebaseObject(firebase.database().ref('usuarios/'+valor.$id));
                raiz.usuario.$loaded().then(function(ref){
                    var rutaAvatar = firebase.storage().ref('usuarios/avatar/'+raiz.usuario.$id+'.'+raiz.usuario.avatar);
                    var ruta = $firebaseStorage(rutaAvatar);
                    ruta.$getDownloadURL().then(function(url) {
                        raiz.rutaAvatar = url;
                    });
                    
                });
            }
        });
    });
    raiz.abreMenu = function($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };
    $rootScope.$on('userUpdate',function(ev,nuevosDatos){
        raiz.usuario = nuevosDatos[0];
        raiz.rutaAvatar = nuevosDatos[1];
    });
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
app.controller('editarPerfil',['$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','Upload','$rootScope',function($firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,Upload,$rootScope){
    console.log('editarPerfil');
    var raiz = this;
    raiz.cargandoImagen = false;
    raiz.auth = $firebaseAuth();
    var usuarioAutenticado = raiz.auth.$getAuth();
    var listaUsuarios = $firebaseArray(firebase.database().ref('usuarios'));
    var avatarStorage;
    listaUsuarios.$loaded().then(function(ref){
        angular.forEach(listaUsuarios, function(valor, llave){
            if(valor.email == usuarioAutenticado.email) {
                raiz.usuario = $firebaseObject(firebase.database().ref('usuarios/'+valor.$id));
                raiz.usuario.$loaded().then(function(ref){
                    var rutaAvatar = firebase.storage().ref('usuarios/avatar/'+raiz.usuario.$id+'.'+raiz.usuario.avatar);
                    avatarStorage = $firebaseStorage(rutaAvatar);
                    avatarStorage.$getDownloadURL().then(function(url) {
                        raiz.rutaAvatar = url;
                    });
                    
                });
            }
        });
    });
    raiz.cambiarAvatar = function(avatar) {
        raiz.cargandoImagen = true;
        if (avatar) {
            var extension;
            switch(avatar.type) {
                case 'image/jpeg':
                    extension = 'jpg';
                    break;
                case 'image/png':
                    extension = 'png';
                    break;
                case 'image/gif':
                    extension = 'gif';
                    break;
                default:
                    extension = 'jpg';
            }
            var cargaAvatar;
            avatarStorage.$delete().then(function() {
                raiz.usuario.avatar = extension;
                avatarStorage = $firebaseStorage(firebase.storage().ref('usuarios/avatar/'+raiz.usuario.$id+'.'+extension));
                cargaAvatar = avatarStorage.$put(avatar, {
                    contentType: avatar.type,
                    usuario: avatar.email
                });
                cargaAvatar.$progress(function(snapshot){
                    raiz.porcentajeCarga = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                });
                cargaAvatar.$complete(function(snapshot) {
                    raiz.rutaAvatar = snapshot.downloadURL;
                    raiz.cargandoImagen = false;
                    raiz.usuario.$save();
                    $rootScope.$emit('userUpdate', [raiz.usuario, raiz.rutaAvatar]);
                });
            });
        }
    };
}]);