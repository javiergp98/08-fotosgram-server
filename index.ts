import Server from './classes/server';
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import fileUpload from 'express-fileupload';

import postRoutes from './routes/post';

const server = new Server();

// Body parser
server.app.use(bodyParser.urlencoded({extended: true}));
server.app.use(bodyParser.json());

// FileUpload
server.app.use(fileUpload());

// Rutas de mi aplicación
server.app.use('/user', userRoutes);
server.app.use('/posts', postRoutes);

// Conectar DB
mongoose.connect('mongodb://localhost:27017/fotosgram', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, (err) => {
    if(err) throw err;

    console.log('Base de datos ONLINE');
});

console.log('Iniciando servidor...');

//Levantar express
server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});