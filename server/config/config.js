// Se declaran variables globales para todos los archivos
// Una manera de hacerlo es con el objeto process global

// =============== 
// Puerto
// ===============

process.env.PORT = process.env.PORT || 3000; //si existe la coge (existirá por ejemplo cuando corra en heroku) y si no pone el 3000 por defecto


// ==============
// Entorno
// ==============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//La variable NODE_ENV la establece Heroku

// ==============
// Base de datos
// ==============

/*Si subimos a github un código que tiene unas credenciales y no queremos que se vean puedo hacer
en keroku variables de configuración personalizadas. Puedo ver las variables que tengo con:
heroku config

Para añadir variables: heroku config:set nombre="Alvaro"
Para obtener una variable: heroku config:get nombre
Para borrar una variable: heroku config:unset nombre

De esta manera si yo creo una variable de configuración para cada credencial, en el código puedo
reemplazar las credenciales por las variables de heroku. Por ejemplo, en la sección 9 del curso:

heroku config:set MONGO_URI="mongodb+srv://adminAtlas:PvAPjEcJcrKpb1Ki@cluster0-curso-node-ogwkt.mongodb.net/cafe"

Tras esto, en el código se pone: process.env.MONGO_URI*/

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;