const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Google signIn
const { OAuth2Client } = require('google-auth-library');
const usuario = require('../models/usuario');
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { //las primeras llaves son la condición que el email que se busca debe ser igual al del body
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        } //Compara la contraseña con la encriptada de la base de datos
        let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //expira en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
})

//Verificaciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

/*Al haber iniciado sesión en http://localhost:3000 con el botón de google,
se ejecuta la función onSignIn de index.html, que devuelve el req de esta 
función de abajo. En el req se encuentra el token de google que se debe 
verificar. Una vez se verifica con la función verify, se comprueba si ese 
usuario ya estaba en nuestra base de datos. En caso de que estuviera y además
iniciado por google se actualiza el token del usuario en la base de datos.*/


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    console.log('idtoken: ', token);
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };
            if (usuarioDB) {
                if (usuarioDB.google === false) { //usuario ya creado pero no mediante google
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Debe de usar su autenticación normal'
                        }
                    });
                } else { //usuario ya creado por google, actualizamos su token
                    let token = jwt.sign({
                            usuario: usuarioDB
                        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //expira en 30 días
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    })
                }
            } else { //usuario no existe en la BD
                let usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = googleUser.google;
                usuario.password = ':)'; //se pone algo pq es obligatorio el campo, pero no sirve

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    };

                    let token = jwt.sign({
                            usuario: usuarioDB
                        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //expira en 30 días
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    })
                });
            }
        })
        // res.json({
        //     usuario: googleUser
        // })
});


module.exports = app;