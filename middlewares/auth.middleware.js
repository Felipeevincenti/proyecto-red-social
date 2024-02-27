// Importar dependencias y otras cosas
const jwt = require('jwt-simple');
const moment = require('moment');


// Importar clave secreta
const jwtService = require('../services/jwt.service');
const secret = jwtService.secret;

// Funcion de autenticacion
exports.auth = (req, res, next) => {

    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        })
    }

    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {

        let payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
                err
            });
        };

        req.user = payload;
    }

    catch (err) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            err
        });
    };

    next();
}

