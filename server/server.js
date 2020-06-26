/*En este proyecto tenemos 2 tipos de token. El primero es el token que generamos nosotros para las peticiones de Usuario y Categoria. El otro tipo es el que tiene que ver con el 
inicio de sesión con google. En el postman para tener el token actualizado tenemos que ejecutar las peticiones Login: normal (cuando queremos por ejemplo crear un nuevo usuario)
y Login: google cuando queremos hacer el inicio de sesión con google. En ambos casos, la variable de entorno de postman se actualiza por el código puesto en el campo Tests del postman. */

require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); //conexión a la base de datos mongo

const path = require('path'); //se usa para habilitar la carpeta public

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Habilitar la carpeta public para que sea accesible desde cualquier lugar
app.use(express.static(path.resolve(__dirname, '../public')));

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