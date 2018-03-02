var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var app = express();
var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/////////////////////////////////////
////// AUTENTICACIÓN GOOGLE  ////////
/////////////////////////////////////
app.post('/google', (req, res, next) => {
    var token = req.body.token;
    const oAuth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_SECRET
    );
    const ticket = oAuth2Client.verifyIdToken({
        idToken: token
            //audience: GOOGLE_CLIENT_ID
    });



    ticket.then(data => {
        Usuario.findOne({ email: data.payload.email }, (err, usuario) => {
            var payload = data.payload;
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });

            }
            if (usuario) {
                if (!usuario.google) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autentificación normal',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });
                usuario.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Login post funciona',
                    usuario: usuario,
                    token: token,
                    id: usuario._id
                });

            } else {
                var usuarioNuevo = new Usuario();
                usuarioNuevo.nombre = payload.name;
                usuarioNuevo.email = payload.email;
                usuarioNuevo.password = ':)';
                usuarioNuevo.img = payload.picture;
                usuarioNuevo.google = true;
                usuarioNuevo.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario',
                            errors: err
                        });
                    }
                    usuarioDB.password = ':)';
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Login Google funciona',
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });

                });


            }

        });
    }).catch(err => {
        res.status(400).json({
            ok: false,
            errors: err
        });

    });
});

/////////////////////////////////////
////// AUTENTICACIÓN NORMAL  ////////
/////////////////////////////////////
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });

        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });

        }

        ///CREACIÓN DE TOKEN
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            mensaje: 'Login post funciona',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });




});





module.exports = app;