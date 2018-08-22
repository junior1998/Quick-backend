var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Usuario = require('../../models/usuarios/usuarios.model');
var mdAutenticacion = require('../../middlewares/autenticacion.js')

var conexion = require('../../socket/socket')

var fileUpload = require('express-fileupload');
var fs = require('fs');
const path = require('path');

app.use(fileUpload());







//Configuracion del socket
conexion.on('connection', (socket) => {
    socket.on('usuarioBD', (usuarioResivido) => {



        // Usuario.find({ estado: 1 }, (err, usuariosBD) => {
        conexion.sockets.emit('usuariosEmitidos', {
            usuario: usuarioResivido.usuarioActua
        })

    })


})













//Google
const CLIENT_ID = '203813453417-upjohav81gf30bsg8aqovr4p4t78vskq.apps.googleusercontent.com';
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// <-==============================================
// <- Renovando token
// <-==============================================

app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, 'esteesunseeddificil', { expiresIn: 14400 }) // 4 horas


    res.status(200).json({
        ok: true,
        token: token

    })
})



// <-==============================================
// <- Login con google
// <-==============================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        correo: payload.email,
        img: payload.picture,
        google: true
    }
}

// <-==============================================
// <- Traer imagen
// <-==============================================

app.get('/:imagen', (req, res) => {

    var imagen = req.params.imagen;

    var pathImagen = path.resolve(__dirname, `./usuario_img/${imagen}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNuevo = path.resolve(__dirname, `./usuario_img/no-img.jpg`);
        res.sendFile(pathNuevo);
    }

})







// <-==============================================
// <- Modificando y subiendo imagen.
// <-==============================================

app.put('/imagen/:id', (req, res) => {

    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: true,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        })
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'PNG', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: true,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        })
    }

    //Nombre del archivo
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    //Movel el archivo del temporal a un path
    var path = `./routes/usuarios/usuario_img/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Error al mover archivo',
                errors: err
            })
        }

        SubirImagenPorId(id, nombreArchivo, res);

    })





})

function SubirImagenPorId(id, nombreArchivo, res) {

    Usuario.findById(id, (err, usuarios) => {
        var pathViejo = './routes/usuarios/usuario_img/' + usuarios.imagen;

        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, function(err) {
                if (err) {
                    return;

                }
            });
        }

        usuarios.imagen = nombreArchivo;

        usuarios.save((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar o subir la imagen',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Imagen subida o actualizada',
                usuarios: usuarios
            });

        });

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el registro',
                errors: err
            })
        }

    })

}




app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Eror en el token'

            })
        })

    Usuario.findOne({ correo: googleUser.correo }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            })
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                })
            } else {
                var token = jwt.sign({ usuario: usuario }, 'esteesunseeddificil', { expiresIn: 14400 }) // 4 horas

                return res.status(200).json({
                    ok: true,
                    usuario: 'El usuario esta logueado',
                    usuario: usuario,
                    token: token,
                    usuario_id: usuario._id
                })
            }
        } else {
            // El usuario no exite.. hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre,
                usuario.correo = googleUser.correo,
                usuario.google = true,
                usuario.password = "):",
                usuario.usuario = googleUser.correo,
                usuario.imagen = googleUser.img


            usuario.save((err, usuario) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el usuario',
                        errors: err
                    })
                }

                var token = jwt.sign({ usuario: usuario }, 'esteesunseeddificil', { expiresIn: 14400 }) // 4 horas


                res.status(200).json({
                    ok: true,
                    usuario: 'El usuario esta logueado',
                    usuario: usuario,
                    token: token,
                    usuario_id: usuario._id
                })
            })

        }
    })

})






// <-==============================================
// <- Login normal
// <-==============================================

app.post('/login', (req, res) => {

    var body = req.body;


    Usuario.findOne({ usuario: body.usuario }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            })
        }

        if (!usuario) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error el usuario no existe',
                errors: err
            })
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error la contraseña es incorrecta',
                errors: err
            })
        }

        // Crear token



        if (body.sesiones == "desactivado") {
            var token = jwt.sign({ usuario: usuario }, 'esteesunseeddificil', { expiresIn: 14400 }) // 4 horas
        } else {
            if (body.sesiones == "activado") {
                var token = jwt.sign({ usuario: usuario }, 'esteesunseeddificil', { expiresIn: 14400 }) // 4 horas

            }
        }

        res.status(200).json({
            ok: true,
            usuario: 'El usuario esta logueado',
            usuario: usuario,
            token: token,
            usuario_id: usuario._id
        })
    })


});

// <-==============================================
// <- Traer todos los usuario con un id
// <-==============================================
app.get('/usuario/:id', (req, res) => {

    var id = req.params.id;

    Usuario.findById(id, (err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando el usuario con un id',
                errors: err
            })
        }

        usuarios.password = '(;'

        res.status(200).json({
            ok: true,
            usuario: usuarios
        })
    })


})




// <-==============================================
// <- Traer todos los usuarios
// <-==============================================

app.get('/', (req, res) => {

    Usuario.find({ estado: 1 }, (err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando cliente',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            usuario: usuarios
        })
    })


})




// <-==============================================
// <- Registrar usuario
// <-==============================================

app.post('/', (req, res) => {

    var body = req.body;


    var usuarios = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        password: bcrypt.hashSync(body.password, 10),
        usuario: body.usuario
    })

    usuarios.save((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: "El usuario o el correo ya existen"
            })
        }


        res.status(200).json({
            ok: true,
            usuarios: usuarios
        })
    })


})

// <-==============================================
// <- Editar usuario con mensaje
// <-==============================================

app.put('/mensaje/:id', (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe'

            })
        }

        usuario.mensajes = body,


            usuario.save((err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al editar el usuario',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    usuario: usuario
                })
            })

    })
})

// <-==============================================
// <- Editar usuario
// <-==============================================

app.put('/:id/:cambiarClave', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    var cambiarClave = req.params.cambiarClave
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar el usuario',
                errors: err
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe'

            })
        }

        usuario.nombre = body.nombre,
            usuario.correo = body.correo
        if (cambiarClave == "si") {
            usuario.password = bcrypt.hashSync(body.password)
        }
        usuario.usuario = body.usuario

        usuario.save((err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al editar el usuario',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                usuario: usuario
            })
        })

    })
})

// <-==============================================
// <- Borrar usuario
// <-==============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndUpdate(id, { estado: 2 }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al editar el usuario',
                errors: err
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe'

            })
        }


        res.status(200).json({
            ok: true,
            usuario: usuario
        })
    })
})






// <-==============================================
// <- Modificando y subiendo imagen.
// <-==============================================


module.exports = app;