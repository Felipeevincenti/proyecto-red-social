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

function contarLetras(palabra) {
    const letras = palabra.length;
    return letras;
};

function contarPalabras(palabras) {
    const palabraSinEspacios = palabras.trim();
    const cantidadPalabrasArray = palabraSinEspacios.split(/\s+/);
    const cantidadPalabras = cantidadPalabrasArray.length;
    return cantidadPalabras;
};

const emailFormat = /^[^\s@]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)$/;

exports.register = async (req, res) => {

    const params = req.body;

    if (!params.name || !params.surname || !params.nick || !params.email || !params.password) {
        return res.status(404).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    };

    if (contarPalabras(params.name) > 2) {
        return res.status(400).send({
            status: "error",
            message: "El nombre no puede tener más de 2 palabras"
        });
    };

    if (contarPalabras(params.surname) > 2) {
        return res.status(400).send({
            status: "error",
            message: "El apellido no puede tener más de 2 palabras"
        });
    };

    if (contarLetras(params.nick) < 4 || contarLetras(params.nick) > 20) {
        return res.status(400).send({
            status: "error",
            message: "El nick debe tener entre 4 y 20 caracteres"
        });
    };

    if (!emailFormat.test(params.email)) {
        return res.status(400).send({
            status: "error",
            message: "El formato del correo electrónico es incorrecto"
        });
    };

    if (params.password.length < 8 || params.password.length > 20) {
        return res.status(400).send({
            status: "error",
            message: "La contraseña debe contener entre 8 y 20"
        });
    };

    UserModel.find({ "nick": params.nick.toLowerCase() })

        .then(async (users) => {

            if (users.length >= 1) {
                return res.status(400).send({
                    status: "error",
                    message: `El nick ya existe`
                });
            };

            UserModel.find({ "email": params.email.toLowerCase() })

                .then(async (user) => {
                    if (user.length >= 1) {
                        return res.status(400).send({
                            status: "error",
                            message: `El email ya existe`
                        });
                    };

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
        .select({ password: false })
        .then(async (userProfile) => {

            const followUserInfo = await followService.followThisUser(req.user.id, idParam);
            const followInfo = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                userProfile,
                following: followInfo.following,
                followers: followInfo.followers
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


    UserModel.find()
        .select("-password -email -role -__v")
        .then(async (usersProfiles) => {

            let followUserIds = await followService.followUserIds(req.user.id)

            return res.status(200).send({
                status: "success",
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

    if (contarPalabras(userToUpdate.name) > 2) {
        return res.status(400).send({
            status: "error",
            message: "El nombre no puede tener más de 2 palabras"
        });
    };

    if (contarPalabras(userToUpdate.surname) > 2) {
        return res.status(400).send({
            status: "error",
            message: "El apellido no puede tener más de 2 palabras"
        });
    };

    if (contarLetras(userToUpdate.nick) < 4 || contarLetras(userToUpdate.nick) > 20) {
        return res.status(400).send({
            status: "error",
            message: "El nick debe tener entre 4 y 20 caracteres"
        });
    };

    // Comprobar si el usuario ya existe
    UserModel.find({
        $or: [
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
        });
}





exports.delete = async (req, res) => {

    try {

        const idParam = req.params.id;
        const userDelete = await UserModel.findByIdAndDelete({ "_id": idParam });

        if (userDelete.image != 'default.png') {
            const imagePathAvatar = path.join(__dirname, '../uploads/avatars', userDelete.image);
            fs.unlinkSync(imagePathAvatar);
        }

        if (!userDelete) {
            return res.status(404).send({
                status: "error",
                message: "No se encontró el usuario"
            });
        }

        const publications = await PublicationModel.find({ "user": idParam });

        for (const publication of publications) {
            await PublicationModel.findOneAndDelete({ "user": publication.user });
            const imagePathPublication = path.join(__dirname, '../uploads/publications', publication.file);
            fs.unlinkSync(imagePathPublication);
        }

        const followings = await FollowModel.find({ "user": idParam });

        for (const following of followings) {
            await FollowModel.findOneAndDelete({ "user": idParam });
        }

        const followers = await FollowModel.find({ "followed": idParam });

        for (const follower of followers) {
            await FollowModel.findOneAndDelete({ "followed": idParam });
        }

        return res.status(200).send({
            status: "success",
            message: "Usuario, publicaciones y follows eliminados"
        });

    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el usuario y sus publicaciones"
        });
    }
};





exports.upload = (req, res) => {

    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "No se recibió ninguna imagen"
        });
    }

    // Obtener la extensión del archivo
    const image = req.file.originalname;
    const imageSplit = image.split(".");
    const ext = imageSplit[imageSplit.length - 1].toLowerCase();
    if (ext != 'png' && ext != 'jpg' && ext != 'jpeg' && ext != 'gif') {

        // Eliminar archivo subido 
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extensión inválida"
        });
    }

    UserModel.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(500).send({
                    status: "error",
                    message: "El usuario no existe"
                });
            }

            // Si el usuario ya tiene una imagen, eliminarla
            if (user.image && user.image != "default.png") {
                const imagePath = path.join(__dirname, '../uploads/avatars', user.image);
                fs.unlinkSync(imagePath);
            }

            // Actualizar la imagen del usuario
            return UserModel.findByIdAndUpdate(req.user.id, { image: req.file.filename }, { new: true });
        })
        .then((userUpdated) => {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al actualizar la imagen"
                });
            }
            return res.status(200).send({
                status: "success",
                message: "Imagen actualizada exitosamente",
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

    let userId = req.params.id;

    if (!userId) userId = req.user.id;
    console.log(userId);

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





exports.buscarUsuario = (req, res) => {

    const busqueda = req.params.busqueda;

    UserModel.find({
        "$or": [
            { "nick": { "$regex": busqueda, "$options": "i" } },
            { "name": { "$regex": busqueda, "$options": "i" } },
            { "surname": { "$regex": busqueda, "$options": "i" } }
        ]
    })
        .sort({ create_at: -1 })
        .then((users) => {
            if (users.length == 0) {
                return res.status(200).send({
                    status: "error",
                    message: "Ningun usuario cohincide con la busqueda"
                })
            }
            return res.status(200).send({
                status: "success",
                message: "Usuarios que cohinciden con tu busqueda",
                users
            })
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Error en la busqueda"
            })
        })
}