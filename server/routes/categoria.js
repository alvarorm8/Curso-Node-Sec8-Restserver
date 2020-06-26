const express = require('express');
const { verificaToken, verificaTokenAdmin_ROle } = require('../middlewares/authentication');
const _ = require('underscore');
let Categoria = require('../models/categoria');
let app = express();

//En mongo cuando se crea una nueva instancia se crean por coleccciones. Por ejemplo en este caso al crear la primera categoria con la petición post, se creará la colección categorias


// ====================
// Mostrar todas las categorías
// ====================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //ordena los elementos alfabeticamente
        .populate('usuario', 'nombre email') //con populate lo que se hace es obtener la información del usuario que se obtiene a través de su id. Busca en otras tablas esa información, en este caso, en la tabla usuarios de la BD
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Categoria.countDocuments({}, (err, conteo) => { //debe tener entre {} la misma condición que find. Uso countDocuments en lugar de count pq decía que el otro esta deprecated
                res.json({
                    ok: true,
                    categorias,
                    Numero_registros: conteo
                })
            })
        })
});

// ====================
// Mostrar una categoría por ID
// ====================
app.get('/categoria/:id', verificaToken, (req, res) => {
    Categoria.findById(req.params.id)
        .populate('usuario', 'nombre email') //con populate lo que se hace es obtener la información del usuario que se obtiene a través de su id. Busca en otras tablas esa información, en este caso, en la tabla usuarios de la BD
        .exec((err, categoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }
            res.json({
                ok: true,
                categoria,
            })
        })
});

// ====================
// Crear nueva categoría
// ====================
app.post('/categoria', [verificaToken, verificaTokenAdmin_ROle], (req, res) => {
    //Crear nueva categoría
    //Se usan los tokens. Al crear una nueva categoría se tiene el id del usuario en el token, se encuentra en req.usuario._id ya que en el middleware verificaToken se crear req.usuario
    //Si hacemos login en postman con el usuario con correo test1@gmail.com por ejemplo, el _id será el de ese usuario ya que se está usando su token para crear la instancia de categoria
    let categoria = new Categoria({
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    })
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
});

// ====================
// Actualizar una categoría por ID
// ====================
app.put('/categoria/:id', [verificaToken, verificaTokenAdmin_ROle], (req, res) => {
    //modificar el nombre
    let id = req.params.id; // es el id de :id, de la cabecera
    let body = _.pick(req.body, ['descripcion']); //_ es underscore, pick es para seleccionar del objeto sólo aquellos parámetros pasados como argumento a esta función

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => { //para ver la estructura de la función https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate 
        //el tercer objeto son las opciones que hay, new = true hace que se devuelva el objeto después de ser modificado,
        //runValidator comprueba las validaciones definidas en el Schema, por ejemplo, que el role es 1 de los 2 permitidos.
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

});

// ====================
// Borrar una categoría por ID
// ====================
app.delete('/categoria/:id', [verificaToken, verificaTokenAdmin_ROle], (req, res) => {
    //Solo un admin puede borrar una categoría
    //Categoría.findByIDAndRemove
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada, el id no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'La categoría se ha borrado'
        })
    })
});

module.exports = app;