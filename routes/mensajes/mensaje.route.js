var express = require('express');
var app = express();
var Mensaje = require('../../models/mensajes/mensaje.model');


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
// <- Traer todos los usuarios
// <-==============================================

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Mensaje.find({ hecho_id: id })
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
// <- Traer todos los usuarios
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
            mensaje.hecho_objeto = body.hecho_objeto

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