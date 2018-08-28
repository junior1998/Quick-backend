var express = require('express');
var app = express();
var Likes = require('../../models/likes/likes.model')
var Nolikes = require('../../models/nolikes/nolikes.model')
var conexion = require('../../socket/socket')

// <-==============================================
// <- Cargar likes 
// <-==============================================

app.get('/likes/:id_men', (req, res) => {
    var id_men = req.params.id_men;
    // var id_usu = req.params.id_usu;
    Likes.find({ id_mensaje: id_men }, (err, likes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar los likes',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            like: likes
        })
    })
})


// <-==============================================
// <- Agregar likes 
// <-==============================================

app.post('/likes/:id_men/:id_usu', (req, res) => {
    var body = req.body
    var id_men = req.params.id_men;
    var id_usu = req.params.id_usu;

    Likes.find({ id_mensaje: id_men, id_usuario: id_usu }, (err, likes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }

        if (likes.length >= 1) {

            Likes.findByIdAndRemove(likes[0]._id, (err, likesBorrado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar el like',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'like borrado',
                    like: likes
                })
            })

        } else {

            var likes = new Likes({
                id_mensaje: id_men,
                id_usuario: id_usu
            })

            likes.save((err, likes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el like',
                        errors: err
                    })
                }

                EliminarNolike(id_men, id_usu)

                res.status(200).json({
                    ok: true,
                    mensaje: 'like',
                    like: likes
                })

            })

        }

    })
})



function EliminarNolike(id_men, id_usu) {
    Nolikes.find({ id_mensaje: id_men, id_usuario: id_usu }, (err, nolikes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }


        if (nolikes.length >= 1) {

            Nolikes.findByIdAndRemove(nolikes[0]._id, (err, nolikesBorrado) => {})

        }
    })
}

app.get('/nolikes/:id_men', (req, res) => {
    var id_men = req.params.id_men;
    // var id_usu = req.params.id_usu;
    Nolikes.find({ id_mensaje: id_men }, (err, nolikes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            nolike: nolikes
        })
    })
})

// <-==============================================
// <- Agregar likes 
// <-==============================================

app.post('/nolikes/:id_men/:id_usu', (req, res) => {
    var body = req.body
    var id_men = req.params.id_men;
    var id_usu = req.params.id_usu;

    Nolikes.find({ id_mensaje: id_men, id_usuario: id_usu }, (err, nolikes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }


        if (nolikes.length >= 1) {

            Nolikes.findByIdAndRemove(nolikes[0]._id, (err, nolikesBorrado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar el like',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'nolike borrado',
                    nolike: nolikesBorrado
                })
            })

        } else {

            var nolikes = new Nolikes({
                id_mensaje: id_men,
                id_usuario: id_usu
            })

            nolikes.save((err, nolikes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el like',
                        errors: err
                    })
                }

                Eliminarlike(id_men, id_usu)

                res.status(200).json({
                    ok: true,
                    mensaje: 'nolike',
                    nolike: nolikes
                })

            })

        }

    })
})


function Eliminarlike(id_men, id_usu) {
    return Likes.find({ id_mensaje: id_men, id_usuario: id_usu }, (err, likes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }


        if (likes.length >= 1) {

            Likes.findByIdAndRemove(likes[0]._id, (err, likesBorrado) => {})

            return true
        }
    })

}


module.exports = app;