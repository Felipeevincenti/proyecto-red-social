// Importacion de dependencias y otras cosas
const fs = require('fs');
const bcrypt = require('bcrypt');
const mongoosPagination = require('mongoose-pagination')

// Importacion de servicios
const jwtService = require('../services/jwt.service');

// Importacion de modelo de usuario
const UserModel = require('../models/user.model');
const userModel = require('../models/user.model');





exports.register = async (req, res) => {

    const params = req.body;

    if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {
        return res.status(404).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    UserModel.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    })

        .then(async (users) => {

            if (users && users.length >= 1) {
                return res.status(200).send({
                    status: "error",
                    message: `El email o el nick ya existen`
                });
            }

            const hash = await bcrypt.hash(params.password, 10);
            params.password = hash;

            const newUser = new UserModel(params);

            newUser.save()

                .then((userStored) => {
                    if (userStored) {
                        return res.status(200).send({
                            status: "success",
                            message: "Usuario registrado exitosamente",
                            userStored
                        })
                    }
                })

                .catch((err) => {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al guardar el usuario"
                    })
                })

        })

        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Error en la consola"
            })
        })
};





exports.login = (req, res) => {

    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    };

    UserModel.findOne({ email: params.email })
        .then((user) => {

            const hash = bcrypt.compareSync(params.password, user.password);

            if (!hash) {
                return res.status(400).send({
                    status: "error",
                    message: "No has ingresado correctamente los datos"
                });
            };

            // Conseguir el token
            const token = jwtService.createToken(user);

            return res.status(200).send({
                status: "success",
                message: "Identificacion exitosa",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token: token
            });
        })

        .catch((err) => {
            return res.status(404).send({
                status: "error",
                message: "No se encontro el usuario"
            });
        });
};



exports.profile = (req, res) => {

    const idParam = req.params.id;

    UserModel.findById(idParam)
        .select({ password: false, role: false })
        .then((userProfile) => {
            return res.status(200).send({
                status: "success",
                userProfile
            });
        })
        .catch((err) => {
            return res.status(404).send({
                status: "error",
                message: "No se encontro el perfil"
            });
        });
};



exports.profiles = (req, res) => {

    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    if (isNaN(page)) {
        return res.status(404).send({
            status: "err",
            message: "Página invalida"
        })
    }

    let itemsPerPage = 6;

    UserModel.find()
        .paginate(page, itemsPerPage)
        .select({ password: false })
        .then((usersProfiles) => {
            return res.status(200).send({
                status: "success",
                itemsPerPage: itemsPerPage,
                usersProfiles
            })
        })
        .catch((err) => {
            return res.status(404).send({
                status: "err",
                message: "Ocurrio un error"
            })
        })
}






exports.update = (req, res) => {

    // Recoger informacion del usuario a actualizar
    const userIdentity = req.user;
    const userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;
    delete userIdentity.image;

    // Comprobar si el usuario ya existe
    userModel.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    })
        .then(async (users) => {

            const userIsset = false;

            users.forEach(user => {
                if (user && user._id != userIdentity.id) userIsset = true;
            })

            if (userIsset) {
                return res.status(200).send({
                    status: "error",
                    message: `El email o el nick ya existen`
                });
            }

            if (userToUpdate.password) {
                const hash = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = hash;
            }

            try {
                const userUpdated = await UserModel.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
                if (!userUpdated) {
                    return res.status(404).send({
                        status: "error",
                        message: "Error al actualizar el usuario"
                    })
                }
                return res.status(200).send({
                    status: "success",
                    message: "Usuario actualizado",
                    user: userUpdated
                })
            } catch (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al actualizar el usuario"
                })
            }

            // Lo mismo que con await pero con promesa
            // .then((userUpdated) => {
            //     return res.status(200).send({
            //         status: "success",
            //         message: "Usuario actualizado",
            //         user: userUpdated
            //     })
            // })
            // .catch((err) => {
            //     return res.status(500).send({
            //         status: "error",
            //         message: "Error al actualizar el usuario"
            //     })
            // })
        });
}


exports.upload = (req, res) => {

    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "No se recibio ninguna imagen"
        });
    };

    // Obtener la extension del archivo
    const image = req.file.originalname;
    const imageSplit = image.split(".");
    const ext = imageSplit[imageSplit.length - 1].toLowerCase();

    if (ext != 'png' && ext != 'jpg' && ext != 'jpeg' && ext != 'gif') {

        // Eliminar archivo subido 
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extension inválida"
        });
    };

    UserModel.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })
        .select({
            password: false
        })
        .then((userUpdated) => {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "El usuario no existe"
                });
            };
            console.log(req.file);
            console.log(req.file.filename);
            return res.status(200).send({
                status: "success",
                message: "Subida de imagen",
                user: userUpdated
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar la imagen",
                err: err
            });
        });
};


