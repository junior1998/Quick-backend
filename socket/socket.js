// Importando express
var express = require("express");
// igualando  las funciones de express a app para poder acceder a ellas
var app = express();

// Importando http para poder comunicarnos mediante http
var http = require('http');
// hacer un npm install socket.io y importarlo para poder usarlo
var socket = require('socket.io');

// haciendo que escuche en el puerto 5000
var service = http.Server(app)
service.listen(5000)
    // Esta es la variable que vamos a exportar para usar en diferentes lugares
var conexion = socket(service)



module.exports = conexion;