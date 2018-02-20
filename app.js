// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


///Inicializar variables

var app = express();

///Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/// Importar Rutas
var appRoute = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoute = require('./routes/login');


///conexión DB
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');


});

/// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoute);
app.use('/', appRoute);


//Escuchar peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});