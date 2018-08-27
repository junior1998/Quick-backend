var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var nolikesScheme = Schema({

    id_mensaje: { type: String },
    id_usuario: { type: String }

})


module.exports = mongoose.model('Nolikes', nolikesScheme);