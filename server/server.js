require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); //conexión a la base de datos mongo

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err, resp) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
    /*
    No importa si la base de datos no existe, cuando hagamos inserciones
    a ella mongoose y mongo la crean.
    */
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ', process.env.PORT);
});