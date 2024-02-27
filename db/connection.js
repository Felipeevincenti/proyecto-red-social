// Importacion de dependencias y otras cosas
const mongoose = require('mongoose');



// Expotacion de funcion para verificar estado de la conexion con la base de datos
exports.connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/Red-Social");
        console.log("Conectado correctamente a base de datos: Red-Social");
    }
    catch (err) {
        console.log(err);
        throw new Error("No se ha podido conectar a la base de datos")
    };
};