/* global angular firebase */
var config = {
    apiKey: "AIzaSyDxRiTUgTD_KKfaeeY0HfUU4iZVcndq3mg",
    authDomain: "resonador-82846.firebaseapp.com",
    databaseURL: "https://resonador-82846.firebaseio.com",
    storageBucket: "resonador-82846.appspot.com",
    messagingSenderId: "237677222662"
};
firebase.initializeApp(config);
var admin = angular.module('admin', [
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'firebase',
    'ngclipboard'
]);
// Controladores
admin.controller('main', ['$scope', '$firebaseArray', '$mdDialog', '$firebaseAuth', '$firebaseStorage', function($scope, $firebaseArray, $mdDialog, $firebaseAuth, $firebaseStorage){
    var raiz = this;
    raiz.variablesCargadas = false;
    raiz.autenticado = false;
    raiz.permisoAdmin = false;
    var usuarioLimpio = {
        'nombres': '',
        'apellidos': '',
        'estado': false,
        'avatar': false,
        'email': '',
        'admin': false
    };
    var refUsuarios = firebase.database().ref('usuarios');
    raiz.listaUsuarios = $firebaseArray(refUsuarios);
    var auth = $firebaseAuth();
    var usuarioFB = auth.$getAuth();
    raiz.listaUsuarios.$loaded().then(function(ref){
        if (usuarioFB) {
            validaUsuario(usuarioFB);
        }
        auth.$onAuthStateChanged(function(firebaseUser) {
            validaUsuario(firebaseUser);
        });
    }).catch(function(error){
        console.log('Error',error);
    });
    raiz.autenticar = function(){
        auth.$signInWithEmailAndPassword(raiz.usuario, raiz.clave).then(function(firebaseUser){
            console.log('Logueado como', firebaseUser.email);
        }).catch(function(error){
            console.log('Error', error);
        });
    };
    raiz.salir = function() {
        console.log('Cerrando sesión...');
        auth.$signOut();
    };
    raiz.crearCodigos = function(ev) {
        $mdDialog.show({
            controller: crearCodigosDialog,
            templateUrl: 'crearCodigos.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function(numCodigos) {
            console.log('Dialogo aceptado', numCodigos);
            for (var i=0;i<numCodigos;i++) {
                raiz.listaUsuarios.$add(usuarioLimpio).then(function(referencia){
                    console.log('Adicionado el usuario', referencia);
                });
            }
        }, function() {
            console.log('Dialog cancelado');
        });
    };
    raiz.rutaAvatar = {};
    raiz.generaRutaAvatar = function(usuario) {
        var rutaAvatar = firebase.storage().ref('usuarios/avatar/'+usuario.$id+'.'+usuario.avatar);
        var ruta = $firebaseStorage(rutaAvatar);
        ruta.$getDownloadURL().then(function(url) {
            raiz.rutaAvatar[usuario.$id] = url;
        });
    };
    raiz.reciclarCodigo = function(ev, usuario) {
        var datosUsuario = {};
        datosUsuario = angular.copy(usuario);
        var confirmacion = $mdDialog.confirm()
            .clickOutsideToClose(true)
            .title('Reciclar código')
            .htmlContent('<i class="fa fa-exclamation-triangle fa-2x"></i> ATENCIÓN: se eliminarán todos los datos del usuario,<br>incluyendo el avatar y otros archivos y se reiniciará el código.<br><br>La información no podrá ser recuperada posteriormente.')
            .ariaLabel('Alert reciclar código')
            .ok('Aceptar')
            .cancel('Cancelar')
            .targetEvent(ev);
        $mdDialog.show(confirmacion)
            .then(function() {
                var numUsuario = raiz.listaUsuarios.$indexFor(usuario.$id);
                raiz.listaUsuarios[numUsuario].nombres = '';
                raiz.listaUsuarios[numUsuario].apellidos = '';
                raiz.listaUsuarios[numUsuario].avatar = '';
                raiz.listaUsuarios[numUsuario].email = '';
                raiz.listaUsuarios[numUsuario].estado = false;
                raiz.listaUsuarios[numUsuario].admin = false;
                raiz.listaUsuarios.$save(usuario).then(function(refe){
                    borrarDatos(datosUsuario);
                });
            }, function() {
                console.log('Cancelación de reciclaje');
        });
    };
    raiz.convertirAdmin = function(ev, usuario) {
        var numUsuario = raiz.listaUsuarios.$indexFor(usuario.$id);
        raiz.listaUsuarios[numUsuario].admin = !usuario.admin;
        raiz.listaUsuarios.$save(usuario).then(function(refe){
            console.log('Nuevo administrador');
        });
        
    };
    raiz.eliminarCodigo = function(ev, usuario) {
        var datosUsuario = {};
        datosUsuario = angular.copy(usuario);
        var confirmacion = $mdDialog.confirm()
            .clickOutsideToClose(true)
            .title('Eliminar código')
            .htmlContent('<i class="fa fa-exclamation-triangle fa-2x"></i> ATENCIÓN: se eliminarán todos los datos del usuario,<br>incluyendo el avatar y otros archivos y se <strong>eliminará</strong> el código.<br><br>La información no podrá ser recuperada posteriormente.')
            .ariaLabel('Alert reciclar código')
            .ok('Aceptar')
            .cancel('Cancelar')
            .targetEvent(ev);
        $mdDialog.show(confirmacion)
            .then(function() {
                raiz.listaUsuarios.$remove(usuario).then(function(ref){
                    borrarDatos(datosUsuario);
                });
            }, function() {
                console.log('Cancelación de eliminación');
        });
    };
    raiz.copiarCB = function(ev) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent('Código copiado al portapapeles')
            .ok('Aceptar')
            .targetEvent(ev)
        );
    };
    function crearCodigosDialog($scope, $mdDialog) {
        $scope.cerrarDialogo = function() {
            $mdDialog.cancel();
        };
        $scope.aceptarDatos = function(numCodigos) {
            $mdDialog.hide(numCodigos);
        };
    }
    function borrarDatos(usuario) {
        var datosAborrar = ['avatar'];
        var base = 'usuarios/';
        angular.forEach(datosAborrar, function(valor, llave){
            var ruta = base+valor+'/'+usuario.$id+'.'+usuario[valor];
            var ref = firebase.storage().ref(ruta);
            var obj = $firebaseStorage(ref);
            if(usuario[valor]) {
                obj.$delete().then(function(){
                    console.log('Eliminado '+valor);
                });
            }
        });
    }
    function validaUsuario(firebaseUser) {
        if (firebaseUser) {
            raiz.autenticado = true;
            var usuario;
            angular.forEach(raiz.listaUsuarios, function(valor, llave) {
                if (valor.email == firebaseUser.email) {
                    usuario = valor;
                }
            });
            if (usuario.admin) {
                raiz.permisoAdmin = true;
            } else {
                raiz.permisoAdmin = false;
            }
            raiz.variablesCargadas = true;
        } else {
            raiz.autenticado = false;
            auth.$signOut();
            raiz.variablesCargadas = true;
        }
    }
}]);