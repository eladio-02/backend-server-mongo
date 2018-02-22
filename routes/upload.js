var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs')

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipos de colección no valida',
            error: { message: 'Las extensiones validas son ' + tiposValidos.join(', ') }
        });
    }


    if (!req.files)
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });

    ////OBTENER NOMBRE DEK ARCHIVO
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    ///SOLO ESTAS EXTENSIONES SE PERMITEN EN ESTE TRABAJO
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            error: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }
    ///NOMBRE PERSONALIZADO
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;


    ////MOVER EL ARCHIVO
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: { message: 'Error al mover archivo ' }
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);


    });


});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });

            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    usuario: usuarioActualizado
                });

            });


        });

    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });

            }


            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    medico: medicoActualizado
                });

            });


        });

    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });

            }


            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    hospital: hospitalActualizado
                });

            });


        });

    }

}


module.exports = app;