const express = require('express');
const app = express();

const Usuario = require('../models/usuario');
const { verificaToken, verificaTokenAdmin_ROle } = require('../middlewares/authentication');

const bcrypt = require('bcrypt');

const _ = require('underscore');

/*Hay varios tipos de peticiones HTML. 
 La petición GET se usa para obtener información del
 servidor.
 La petición POST es para crear nuevos registros.
 La petición PUT es para actualizar registros.
 La petición DELETE no se usa para borrar actualmente
 ningún registro de una base de datos, si no que se 
 suele cambiar un estado de una variable o similar 
 para que dicho registro no esté disponible */

app.get('/usuario', verificaToken, function(req, res) {
    //Buscamos varios usuarios con la condición definida en find y exec ejecuta la búsqueda
    //si no se indica nada, se cogen todos los usuarios
    let desde = req.query.desde || 0; //si no se encuentra en el parámetro de entrada es 0
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Usuario.find({ estado: true }, 'nombre email role estado google img') //sólo queremos que se muestren nombre, email, role, estado, google, img. El id siempre se muestra
        .skip(desde) //salta los primeros N registros
        .limit(limite) //devuelve N usuarios como máximo
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: true }, (err, conteo) => { //debe tener entre {} la misma condición que find
                res.json({
                    ok: true,
                    usuarios,
                    Numero_registros: conteo
                })
            })
        })
})

app.post('/usuario', [verificaToken, verificaTokenAdmin_ROle], function(req, res) { //nuevo usuario
    let body = req.body;
    /*Ese objeto es el que el body-parser va a procesar
    cuando se reciba una petición. En el postman se manda el body
    como x-www-form-urlencoded dentro de la opción body*/
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //encriptamos la constraseña con un hass de una sola vía con 10 iteraciones
        role: body.role
    });

    usuario.save((err, usuarioDB) => { //save es una palabra reservada de mongoose para guardar en la BD
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        //usuarioDB.password = null; //esto sirve para que en la respuesta no aparezca la contraseña, pero sí esta almacenada en mongo
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })

    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     })
    // }
})

app.put('/usuario/:id', [verificaToken, verificaTokenAdmin_ROle], function(req, res) { //actualizar usuario, :id es el parámetro a recibir
    let id = req.params.id; // es el id de :id, de la cabecera
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']); //_ es underscore, pick es para seleccionar del objeto sólo aquellos parámetros pasados como argumento a esta función

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => { //para ver la estructura de la función https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate 
        //el tercer objeto son las opciones que hay, new = true hace que se devuelva el objeto después de ser modificado,
        //runValidator comprueba las validaciones definidas en el Schema, por ejemplo, que el role es 1 de los 2 permitidos.
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.delete('/usuario/:id', [verificaToken, verificaTokenAdmin_ROle], function(req, res) {
    let borradoFisico = req.body.borradoFisico;
    if (borradoFisico == 'false') {
        borradoFisico = false;
    }
    if (borradoFisico == 'true') {
        borradoFisico = true;
    }
    let id = req.params.id;
    if (borradoFisico) { //borramos físicamente el usuario de la BD
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                usuario: usuarioBorrado
            })
        })
    } else { //actualizamos la variable estado del registro a false
        let body = {
            estado: false
        }
        Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                usuario: usuarioDB
            })
        })
    }
})

module.exports = app;