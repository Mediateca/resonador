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
var rutaAvatarGenerica = 'assets/img/avatar_generico.png';
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
                    if (raiz.usuario.avatar) {
                        var rutaAvatar = firebase.storage().ref('usuarios/avatar/'+raiz.usuario.$id+'.'+raiz.usuario.avatar);
                        var ruta = $firebaseStorage(rutaAvatar);
                        ruta.$getDownloadURL().then(function(url) {
                            raiz.rutaAvatar = url;
                        }, function(error){
                            raiz.rutaAvatar = rutaAvatarGenerica;
                        });
                    } else {
                        raiz.rutaAvatar = rutaAvatarGenerica;
                    }
                });
            }
        });
    });
    raiz.abreMenu = function($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };
    $rootScope.$on('userUpdate', function (event, data) {
        raiz.usuario = data[0];
        raiz.rutaAvatar = data[1];
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
app.controller('registro', ['$firebaseObject','$firebaseAuth','$mdDialog','$location',function($firebaseObject,$firebaseAuth,$mdDialog,$location){
    console.log('registro');
    var auth = $firebaseAuth();
    var usuario;
    var raiz =  this;
    raiz.codigoValidado = false;
    raiz.codigoInvalido = false;
    raiz.validarCodigo = function(codigo){
        usuario = $firebaseObject(firebase.database().ref('usuarios/'+codigo));
        if (codigo) {
            usuario.$loaded().then(function(data){
                if (usuario.$value !== null && !usuario.email) {
                    raiz.codigoValidado = true;
                    raiz.codigoInvalido = false;
                } else {
                    raiz.codigoInvalido = true;
                }
            },function(error){console.log('Error',error)});
        }
    };
    raiz.enterCodigo = function(tecla, codigo) {
        if (tecla.key == 'Enter') {
            raiz.validarCodigo(codigo);
        }  
    };
    raiz.registrar = function() {
        auth.$createUserWithEmailAndPassword(raiz.email, raiz.clave).then(function(firebaseUser) {
            usuario.nombres = raiz.nombres;
            usuario.apellidos = raiz.apellidos;
            usuario.email = raiz.email;
            usuario.estado = true;
            usuario.avatar = false;
            usuario.$save().then(function(){
                $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Registro exitoso')
                    .textContent('Ha sido registrado correctamente. Ahora será re-dirigido a la página principal.')
                    .ariaLabel('Registro existoso')
                    .ok('Aceptar')
                ).then(function(){
                    auth.$signInWithEmailAndPassword(raiz.email, raiz.clave).then(function(firebaseUser){
                        console.log('Logueado como', firebaseUser.email);
                        $location.path('/');
                    }).catch(function(error){
                        console.log('Error', error);
                    });
                });
            },function(error){console.log('Error',error)});
        }).catch(function(error) {
            console.error("Error: ", error);
        });
    };
}]);
app.controller('editarPerfil',['$firebaseAuth','$firebaseObject','$firebaseStorage','$firebaseArray','$rootScope','$mdToast','$timeout',function($firebaseAuth,$firebaseObject,$firebaseStorage,$firebaseArray,$rootScope,$mdToast,$timeout){
    console.log('editarPerfil');
    var raiz = this;
    raiz.cargandoImagen = false;
    raiz.auth = $firebaseAuth();
    raiz.claveActualValida = false;
    raiz.verificandoClave = false;
    raiz.errorAutenticacion = false;
    raiz.cambiandoClave = false;
    var usuarioAutenticado = raiz.auth.$getAuth();
    var listaUsuarios = $firebaseArray(firebase.database().ref('usuarios'));
    var avatarStorage;
    listaUsuarios.$loaded().then(function(ref){
        angular.forEach(listaUsuarios, function(valor, llave){
            if(valor.email == usuarioAutenticado.email) {
                raiz.usuario = $firebaseObject(firebase.database().ref('usuarios/'+valor.$id));
                raiz.usuario.$loaded().then(function(ref){
                    if (raiz.usuario.avatar) {
                        var rutaAvatar = firebase.storage().ref('usuarios/avatar/'+raiz.usuario.$id+'.'+raiz.usuario.avatar);
                        avatarStorage = $firebaseStorage(rutaAvatar);
                        avatarStorage.$getDownloadURL().then(function(url) {
                            raiz.rutaAvatar = url;
                        }, function(error){
                            raiz.rutaAvatar = rutaAvatarGenerica;
                        });
                    } else {
                        raiz.rutaAvatar = rutaAvatarGenerica;
                    }
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
                    raiz.guardaDatos(0);
                });
            });
        }
    };
    raiz.guardaDatos = function(delay) {
        $timeout(function(){
            usuarioAutenticado.updateProfile({
                displayName: raiz.usuario.nombres+' '+raiz.usuario.apellidos,
                photoURL: raiz.rutaAvatar
            }).then(function() {
                console.log('Datos auth actualizados');
            }, function(error) {
                console.log('Error',error);
            });
            raiz.usuario.$save();
            $rootScope.$emit('userUpdate', [raiz.usuario, raiz.rutaAvatar]);
            $mdToast.show(
                $mdToast.simple()
                .textContent('¡Datos actualizados!')
                .hideDelay(3000)
            );
        },delay);
    };
    raiz.validaClave = function() {
        raiz.verificandoClave = true;
        var credencial = firebase.auth.EmailAuthProvider.credential(
            usuarioAutenticado.email,
            raiz.claveActual
        );
        usuarioAutenticado.reauthenticate(credencial).then(function(){
            raiz.claveActualValida = true;
            raiz.errorAutenticacion = false;
            $timeout(function(){
                raiz.verificandoClave = false;
            },1000);
        },function(error){
            console.log('Error re-autenticando',error);
            raiz.claveActualValida = false;
            $timeout(function(){
                raiz.verificandoClave = false;
                raiz.errorAutenticacion = true;
            },1000);
        });
    };
    raiz.guardaClave = function(panel) {
        raiz.cambiandoClave = true;
        raiz.auth.$updatePassword(raiz.claveNueva).then(function() {
            $timeout(function() {
                raiz.cambiandoClave = false;
                panel.collapse();
                raiz.claveVerif = '';
                raiz.claveNueva = '';
                raiz.claveActual = '';
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('¡Contraseña actualizada!')
                    .hideDelay(3000)
                );
            },1000);
        }).catch(function(error){
            'Error',error;
            raiz.cambiandoClave = false;
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('Error:'+error+' Intente de nuevo.')
                    .hideDelay(5000)
                );
        });
    };
}]);