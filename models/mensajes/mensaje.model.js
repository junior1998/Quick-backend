var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var mensajeScheme = Schema({

    nombre_error: { type: String, required: [true, "el nombre del error es requerido"] },
    tipo_error: { type: String, required: [true, "el tipo del erro es requerido"] },
    fecha: { type: String, required: [true, "la fecha es requerida"] },
    solucion: { type: String, required: [true, "la solucion es requerida"] },
    hecho_id: { type: String, required: [true, "El id de quien lo hizo"] },
    likes: { type: Array },
    no_megusta: { type: Array },
    id_temp: { type: String },
    tipo_like: { type: String },
    tipo_nolike: { type: String },
    hecho_objeto: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    estado: { type: Number, required: [true, "el estado es requierido"], default: 1 },

})


module.exports = mongoose.model('Mensajes', mensajeScheme);