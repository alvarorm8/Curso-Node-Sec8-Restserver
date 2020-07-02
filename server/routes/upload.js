const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true })); //cuando llamamos a fileUpload() todos los archivos que se carguen caen dentro de req.files

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    //Validar tipos
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
                tipo_enviado: tipo
            }
        });
    }

    // archivo es el nombre de la variable que se manda con la petición desde postman.
    let sampleFile = req.files.archivo;
    let nombreSeparado = sampleFile.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1];

    // Extensiones permitidas 
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => { //se sube en la carpeta uploads del servidor
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        //Imagen cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios'); //si hay un error, se borra la imagen que se acaba de subir
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios'); //si hay un error, se borra la imagen que se acaba de subir
            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'El usuario no existe en la BD'
                    }
                });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    })

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos'); //si hay un error, se borra la imagen que se acaba de subir
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos'); //si hay un error, se borra la imagen que se acaba de subir
            return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'El producto no existe en la BD'
                    }
                });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });
            }
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) { //eliminamos la imagen ya existente si existe
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;