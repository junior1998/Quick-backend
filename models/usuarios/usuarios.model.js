var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


var usuariosScheme = Schema({

    nombre: { type: String, required: [true, "el nombre es requerido"] },
    correo: { type: String, required: [true, "el correo es requerido"], unique: true },
    token: { type: String, },
    google: { type: Boolean, required: [true, "el token es obligatorio"], default: false },
    password: { type: String, required: [true, "la contraseña es requerida"] },
    usuario: { type: String, required: [true, "el usuario es requerido"], index: true, unique: true },
    imagen: { type: String, required: false },
    mensajes: { type: Array, },
    estado: { type: Number, required: [true, "el estado es requierido"], default: 1 },

})

usuariosScheme.set('autoIndex', false); // REQUIRED FOR UNIQUE INDEX AND INDEX IDENTIFIERS

usuariosScheme.plugin(uniqueValidator, { message: '{PATH} debe ser unico' })


module.exports = mongoose.model('Usuario', usuariosScheme);