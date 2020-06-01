// Se declaran variables globales para todos los archivos
// Una manera de hacerlo es con el objeto process global

// =============== 
// Puerto
// ===============

process.env.PORT = process.env.PORT || 3000; //si existe la coge (existirá por ejemplo cuando corra en heroku) y si no pone el 3000 por defecto