var express = require('express');
var app = express();
var Mensaje = require('../../models/mensajes/mensaje.model');
var conexion = require('../../socket/socket')

//Configuracion del socket
conexion.on('connection', (socket) => {
    socket.on('mensajeDB', (mensajeResivido) => {
        conexion.sockets.emit('mensajesEmitido', {
            mensaje: mensajeResivido.mensajeActual
        })

    })

    socket.on('MensajeObjeto', (mensajeOBjetoResivido) => {
        conexion.sockets.emit('mensajesObjetoEmitido', {
            mensaje: mensajeOBjetoResivido.mensajeActual
        })

    })

})














// <-==============================================
// <- Borrar id del de los que han dado like 
// <-==============================================

app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Mensaje.findByIdAndRemove(id, (err, mensajeBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar id',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            mensajeBorrado: mensajeBorrado
        })
    })
})






// <-==============================================
// <- Busqueda 
// <-==============================================

app.get('/buscar/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Mensaje.find({}).or([{ 'nombre_error': regex }, { 'tipo_error': regex }, { 'solucion': regex }])
        .populate('hecho_objeto')
        .exec((err, mensaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error este mensaje no existe',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensaje
            })
        })
})




// <-==============================================
// <- Traer un mensaje con un id
// <-==============================================

app.get('/mensaje/:id', (req, res) => {

    var id = req.params.id;

    Mensaje.findById(id, (err, mensajes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando el mensaje con un id',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            mensaje: mensajes
        })
    })


})

// <-==============================================
// <- Traer todos los mensajes con id
// <-==============================================

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Mensaje.find({ hecho_id: id, estado: 1 })
        .populate('hecho_objeto')
        .exec((err, mensajes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando mensajes',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensajes
            })
        })


})




// <-==============================================
// <- Traer todos los mensaje
// <-==============================================

app.get('/', (req, res) => {

    Mensaje.find({ estado: 1 })
        .populate('hecho_objeto')
        .exec((err, mensajes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando mensajes',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensajes
            })
        })


})



// <-==============================================
// <- Crear mensaje
// <-==============================================
app.post('/', (req, res) => {
    var body = req.body;

    var fecha_ = new Date()
    var dia = fecha_.getDay()
    var mes = fecha_.getMonth()
    var ano = fecha_.getFullYear()
    var hora = fecha_.getHours()
    var fecha_final = dia + '/' + mes + '/' + ano;


    var mensaje = new Mensaje({
        nombre_error: body.nombre_error,
        tipo_error: body.tipo_error,
        fecha: fecha_final,
        solucion: body.solucion,
        hecho_id: body.hecho_id,
        hecho_objeto: body.hecho_objeto,
        like: 0,
        no_like: 0,
        estado: 1
    })

    mensaje.save((err, mensajes) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al registrar el mensajes',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            mensaje: mensaje
        })
    })
})

// <-=====================================================
// <- Traer todos los mensajes con los id de los clientes
// <-=====================================================

app.get('/likes/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var campo_likes = req.params.campo_likes;

    Mensaje.find({ _id: id })
        .populate('hecho_objeto')
        .exec((err, mensajes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando mensajes',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensajes
            })
        })


})


// <-==============================================
// <- Actualizar like 
// <-==============================================
app.put('/likes/:like/:no_like/:id', (req, res) => {
    var like = req.params.like;
    var no_like = req.params.no_like;
    var id = req.params.id;
    var body = req.body;

    Mensaje.findById(id, (err, mensaje) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }

        if (!mensaje) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El mensaje con el id' + id + 'no existe'

            })
        }

        console.log(body)


        if (like == 'likes') {
            mensaje.likes = body;
        } else {
            if (no_like == 'no_like') {
                mensaje.no_megusta = body
            }
        }


        mensaje.save((err, mensaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar el mensaje',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensaje
            })
        })
    })
})

// <-==============================================
// <- Actualizar
// <-==============================================
app.put('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Mensaje.findById(id, (err, mensaje) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }

        if (!mensaje) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El mensaje con el id' + id + 'no existe'

            })
        }

        var fecha_ = new Date()
        var dia = fecha_.getDay()
        var mes = fecha_.getMonth()
        var ano = fecha_.getFullYear()
        var hora = fecha_.getHours()
        var fecha_final = dia + '/' + mes + '/' + ano;

        mensaje.nombre_error = body.nombre_error,
            mensaje.tipo_error = body.tipo_error,
            mensaje.solucion = body.solucion,
            mensaje.fecha = fecha_final,
            mensaje.hecho_id = body.hecho_id,
            mensaje.hecho_objeto = body.hecho_objeto,
            mensaje.likes = body.likes,
            mensaje.no_megusta = body.no_megusta

        mensaje.save((err, mensaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar el mensaje',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensaje
            })
        })
    })
})

// <-==============================================
// <- Borrar mensaje
// <-==============================================

app.put('/borrar/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Mensaje.findById(id, (err, mensaje) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el mensaje',
                errors: err
            })
        }

        if (!mensaje) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error mensaje no existe',
                errors: err
            })
        }

        mensaje.estado = 2;

        mensaje.save((err, mensaje) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar el mensaje',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: mensaje
            })
        })
    })
})

module.exports = app;