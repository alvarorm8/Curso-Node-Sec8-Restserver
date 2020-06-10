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

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;