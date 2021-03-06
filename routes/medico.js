var express = require('express');

var app = express();


var mdAutenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');

/////////////////////////////////////////////// 
/// OBTENER TODOS LOS HOSPITALES ////////////////
/////////////////////////////////////////////// 
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Get de medicos',
                    errors: err
                });

            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            });


        });
});
/////////////////////////////////////////////// 
/// OBTENER UN SOLO MEDICO ////////////////
/////////////////////////////////////////////// 
app.get('/:id', (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });

            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no fue encontrado',
                    errors: { message: 'No existe un medico con ese id' }
                });
            }

            res.status(201).json({
                ok: true,
                medico: medico
            });

        });

});
/////////////////////////////////////////////// 
/// CREAR UN MEDICO ////////////////
/////////////////////////////////////////////// 
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;


    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });

        }


        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });


    });
});
/////////////////////////////////////////////// 
/// ACTUALIZAR UN USUARIO ////////////////
/////////////////////////////////////////////// 
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });

        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no fue encontrado',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

/////////////////////////////////////////////// 
/// ELIMINAR UN HOSPITAL ////////////////
/////////////////////////////////////////////// 
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;