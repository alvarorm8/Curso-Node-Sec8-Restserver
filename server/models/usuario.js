const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role válido' //en {VALUE} se inserta automáticamente lo que se manda en el body del postman
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true, //no se puede repetir un correo
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        //required: [true, 'El role es obligatoria'],
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function() {
    /*
    Función que sirve para que cuando se imprima el objeto
    por consola con un toJSON no aparezca la contraseña
    */
    let user = this; //cogemos el objeto que hay en ese momento
    let userObject = user.toObject();

    delete userObject.password;
    return userObject;
}

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' }); //con esto se hace que en el postman
//al intentar poner 2 usuarios con el mismo correo salga un error. Donde pone PATH se inserta automáticamente 
//el nombre de la propiedad que da error, en este caso, email.

module.exports = mongoose.model('Usuario', usuarioSchema);