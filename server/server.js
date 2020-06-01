require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/*Hay varios tipos de peticiones HTML. 
 La petición GET se usa para obtener información del
 servidor.
 La petición POST es para crear nuevos registros.
 La petición PUT es para actualizar registros.
 La petición DELETE no se usa para borrar actualmente
 ningún registro de una base de datos, si no que se 
 suele cambiar un estado de una variable o similar 
 para que dicho registro no esté disponible */

app.get('/usuario', function(req, res) {
    res.json('get Usuario')
})

app.post('/usuario', function(req, res) {
    let body = req.body;
    /*Ese objeto es el que el body-parser va a procesar
    cuando se reciba una petición */
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        })
    }
})

app.put('/usuario/:id', function(req, res) { //:id es el parámetro a recibir
    let id = req.params.id; // es el id de :id, de la cabecera
    res.json({
        id
    })
})

app.delete('/usuario', function(req, res) {
    res.json('delete Usuario')
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto ', process.env.PORT);
});