// Importacion de dependencias y otras cosas 
const express = require('express');
const cors = require('cors');
const app = express();

// Importacion de rutas
const routesUser = require('./router/user.routes');
const routesFollow = require('./router/follow.routes');
const routesPublication = require('./router/publication.routes');

// Conexion con la base de datos
const connectionDb = require('./db/connection');
connectionDb.connection();

const puerto = 3000;

app.use(cors());

// Modificacion de los datos enviados por body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/user", routesUser);
app.use("/api/follow", routesFollow);
app.use("/api/publication", routesPublication);

// Iniciando servidor
app.listen(puerto, () => {
    console.log("Servidor corriendo en puerto " + puerto);
});