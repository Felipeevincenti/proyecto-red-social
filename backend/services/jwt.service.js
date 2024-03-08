// Importacion de dependencias y otras cosas 
const jwt = require('jwt-simple');
const moment = require('moment');

// Clave secreta
const secret = "clave_secreta_del_curso_del_proyecto_de_la_red_social_123123";

const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolucion token
    return jwt.encode(payload, secret);

};

module.exports = {
    secret,
    createToken
};


