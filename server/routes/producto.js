const express = require('express');
const { verificaToken } = require('../middlewares/authentication');
const _ = require('underscore');
const Producto = require('../models/producto');
let app = express();

// ====================
// Buscar productos
// ====================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); //creamos una expresión regular con la opción de que no considere mayúsculas y minúsculas para que al buscar en la base de datos por ejemplo
    //ensalada, me salgan todas las ensaladas que haya
    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        })
});

// ====================
// Obtener todos los productos
// ====================
app.get('/productos', verificaToken, (req, res) => {
    //populate: usuario, categoria
    //paginado
    let desde = req.query.desde || 0; //si no se encuentra en el parámetro de entrada es 0
    desde = Number(desde);
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .sort('nombre') //ordena los elementos alfabeticamente
        .populate('usuario', 'nombre email') //con populate lo que se hace es obtener la información del usuario que se obtiene a través de su id. Busca en otras tablas esa información, en este caso, en la tabla usuarios de la BD
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments({ disponible: true }, (err, conteo) => { //debe tener entre {} la misma condición que find. Uso countDocuments en lugar de count pq decía que el otro esta deprecated
                res.json({
                    ok: true,
                    productos,
                    Numero_registros: conteo
                })
            })
        })
});


// ====================
// Obtener un producto por ID
// ====================
app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario, categoria
    Producto.findById(req.params.id)
        .populate('usuario', 'nombre email') //con populate lo que se hace es obtener la información del usuario que se obtiene a través de su id. Busca en otras tablas esa información, en este caso, en la tabla usuarios de la BD
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }
            res.json({
                ok: true,
                producto,
            })
        })
});

// ====================
// Crear un nuevo producto 
// ====================
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado 
    //grabar el producto
    let producto = new Producto({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        disponible: req.body.disponible,
        categoria: req.body.categoriaID,
        usuario: req.usuario._id
    });
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    })
});

// ====================
// Actualizar un producto por ID
// ====================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id; // es el id de :id, de la cabecera
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria', 'disponible']); //_ es underscore, pick es para seleccionar del objeto sólo aquellos parámetros pasados como argumento a esta función

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => { //para ver la estructura de la función https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate 
        //el tercer objeto son las opciones que hay, new = true hace que se devuelva el objeto después de ser modificado,
        //runValidator comprueba las validaciones definidas en el Schema, por ejemplo, que el role es 1 de los 2 permitidos.
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    })
});

// ====================
// Borrar un producto por ID
// ====================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //no se borra, se pone disponible a false
    let id = req.params.id;
    let body = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB,
            message: 'El producto se ha deshabilitado'
        })
    })
});



module.exports = app;