// Importacion de dependencias y otras cosas
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoosPagination = require('mongoose-pagination')

// Importacion de servicios
const jwtService = require('../services/jwt.service');
const followService = require('../services/follow.service');

// Importacion de modelo de usuario
const UserModel = require('../models/user.model');
const FollowModel = require('../models/follow.model');
const PublicationModel = require('../models/publication.model');





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
                return res.status(404).send({
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
                        err,
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
        .then(async (userProfile) => {

            const followInfo = await followService.followThisUser(req.user.id, idParam);

            return res.status(200).send({
                status: "success",
                userProfile,
                following: followInfo.following,
                follower: followInfo.follower
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
        .select("-password -email -role -__v")
        .then(async (usersProfiles) => {

            let followUserIds = await followService.followUserIds(req.user.id)

            return res.status(200).send({
                status: "success",
                itemsPerPage: itemsPerPage,
                usersProfiles,
                userFollowing: followUserIds.following,
                userFollowMe: followUserIds.followers
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
    UserModel.find({
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
            } else {
                delete userToUpdate.password;
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
        .then((userUpdated) => {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "El usuario no existe"
                });
            };
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





exports.avatar = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/avatars/" + file;

    fs.stat(filePath, (err, exists) => {

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            })
        }

        return res.sendFile(path.resolve(filePath));

    });
}





exports.counters = async (req, res) => {

    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    };

    try {
        const following = await FollowModel.countDocuments({ "user": userId })
        const followed = await FollowModel.countDocuments({ "followed": userId });
        const publications = await PublicationModel.countDocuments({ "user": userId });

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        })
    }
    catch (err) {
        return res.status(500).send({
            status: "error",
            message: "Error al contar los datos"
        })
    }
}