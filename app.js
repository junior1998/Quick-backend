// <-==============================================
// <-                 REQUIRES
// <-==============================================
var express = require('express');
var mongoose = require('mongoose');


// <-==============================================
// <-            INICIALIZAR VARIABLES
// <-==============================================
var app = express();
var path = require('path')
    // <-==============================================
    // <-  				IMPORTAR RUTAS
    // <-==============================================
var usuariosRoutes = require('./routes/usuarios/usuarios.route.js');
var mensajesRoutes = require('./routes/mensajes/mensaje.route.js');







// <-==============================================
// <- 				  PERMISOS
// <-==============================================
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
    next();
});


// <-==============================================
// <- 		 CONEXION A LA BASE DE DATOS
// <-==============================================
var db = "admin";
mongoose.connection.openUri('mongodb://firemongo:321654@198.199.72.76:27017/' + db, (err, res) => {

    if (err) throw err;

    console.log(`[${db}] MongoDB - \x1b[32monline\x1b[0m`)

})

// // <-==============================================
// // <- 				BODY-PARSER
// // <-==============================================	
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())


// <-==============================================
// <-                   RUTAS
// <-==============================================
app.use('/usuarios', usuariosRoutes);
app.use('/mensajes', mensajesRoutes);
app.use(express.static(path.join(__dirname, '../Quick/dist/Quick')))
    // app.get('/', (req, res) => {
    // })



//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});