// Importacion de servicios
const followService = require('../services/follow.service')

// Importacion de modelos
const UserModel = require('../models/user.model');
const FollowModel = require('../models/follow.model');





// Accion de guardar Follow
exports.follow = (req, res) => {

    const params = req.body;
    const identity = req.user;

    FollowModel.findOne({ user: identity.id, followed: params.followed })
        .then((existFollow) => {
            if (existFollow) {
                return res.status(400).send({
                    status: "error",
                    message: "Ya estás siguiendo a este usuario"
                });
            } else if (identity.id == params.followed) {
                return res.status(400).send({
                    status: "error",
                    message: "No te podes seguir a vos mismo"
                });
            }
            else {
                const userToFollow = new FollowModel({
                    user: identity.id,
                    followed: params.followed
                });

                userToFollow.save()
                    .then((followStored) => {
                        return res.status(200).send({
                            status: "success",
                            message: "Metodo de seguir usuario",
                            identity,
                            followStored
                        });
                    })
                    .catch((err) => {
                        return res.status(500).send({
                            status: "error",
                            message: "No se ha podido seguir al usuario"
                        });
                    });
            }
        })
        .catch((err) => {
            // Manejar errores al verificar si el usuario ya está siguiendo al usuario a seguir
            return res.status(500).send({
                status: "error",
                message: "Error al verificar el seguimiento del usuario"
            });
        });
};





exports.unfollow = (req, res) => {

    const identity = req.user.id;
    const followedId = req.params.id;

    FollowModel.findOneAndDelete({
        "user": identity,
        "followed": followedId
    })
        .then((followDelete) => {
            delete followDelete
            return res.status(200).send({
                status: "success",
                message: "Dejaste de seguir al usuario",
                followed: followDelete
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "No se encontro el usuario"
            });
        })
}





exports.following = (req, res) => {

    let userId = req.user.id;

    if (req.params.id) userId = req.params.id;

    // Primero, obtenemos la cantidad total de follows
    FollowModel.find({ user: userId })
        .populate("user followed", "-password -role -__v -email")

        .then(async (follows) => {

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                userId,
                message: "Id sigue a estos usuarios (seguidos)",
                follows,
                userFollowing: followUserIds.following,
                userFollowMe: followUserIds.followers,
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Mensaje de error"
            });
        });
}





exports.followers = (req, res) => {

    let userId = req.user.id;

    if (req.params.id) userId = req.params.id;

    // Primero, obtenemos la cantidad total de follows
    FollowModel.find({ user: userId })
        .populate("user", "-password -role -__v -email")

        .then(async (follows) => {

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                userId,
                message: "Id me siguen estos usuarios",
                follows,
                userFollowing: followUserIds.following,
                userFollowMe: followUserIds.followers
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Mensaje de error"
            });
        });
}
