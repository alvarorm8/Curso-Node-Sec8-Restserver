const jwt = require('jsonwebtoken');
// ======================
// Verificar token
// ======================

let verificaToken = (req, res, next) => {
    let token = req.get('token'); // cogemos el header de la petición llamado token

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }
        req.usuario = decoded.usuario; //decoded.usuario es el res.usuario de login.js
        next(); //si no se llama a esta función, cuando importamos el middleware
        //en una función en routes/usuario.js no se ejecuta lo siguiente
    });
};

// ======================
// Verificar ADMIN_ROLE
// ======================

let verificaTokenAdmin_ROle = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Usuario sin los privilegios necesarios'
            }
        })
    }
    next();
};

// ======================
// Verificar token para imagen
// ======================

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token; //cogemos el token del url de la imagen al poner en postman {{url}}/imagen/...?token=
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }
        req.usuario = decoded.usuario; //decoded.usuario es el res.usuario de login.js
        next(); //si no se llama a esta función, cuando importamos el middleware
        //en una función en routes/usuario.js no se ejecuta lo siguiente
    });
}

module.exports = {
    verificaToken,
    verificaTokenAdmin_ROle,
    verificaTokenImg
}