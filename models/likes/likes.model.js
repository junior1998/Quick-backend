var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var likesScheme = Schema({

    id_mensaje: { type: String },
    id_usuario: { type: String }

})


module.exports = mongoose.model('Likes', likesScheme);