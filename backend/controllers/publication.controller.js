// Importacion de dependencias y otras cosas
const fs = require('fs');
const path = require('path')
const mongoosePagination = require('mongoose-pagination');

// Importacion de modelos
const PublicationModel = require('../models/publication.model');

// Imporatcion de servicios
const followService = require('../services/follow.service')




exports.save = async (req, res) => {

    const params = req.body;

    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Faltan enviar datos"
        });
    };

    const newPublication = new PublicationModel(params);
    newPublication.user = req.user.id;
    newPublication.save()
        .then((publicationStored) => {
            return res.status(200).send({
                status: "success",
                message: "Guardar Publicacion",
                publicationStored
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar la publicacion"
            });
        });
};





exports.details = (req, res) => {

    const paramsId = req.params.id;

    PublicationModel.findById(paramsId)
        .then((detailsPublication) => {
            if (!detailsPublication) {
                return res.status(404).send({
                    status: "error",
                    message: "Publicación no encontrada"
                });
            };
            return res.status(200).send({
                status: "success",
                message: "Detalles de publicacion",
                detailsPublication
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Error al buscar la publicacion"
            });
        });
};





exports.remove = (req, res) => {

    const paramsId = req.params.id;

    PublicationModel.findOneAndDelete({ "user": req.user.id, "_id": paramsId }) // Corregido
        .then((publicationRemove) => {
            if (!publicationRemove) {
                return res.status(404).send({
                    status: "error",
                    message: "Publicación no encontrada"
                });
            }

            const imagePath = path.join(__dirname, '../uploads/publications', publicationRemove.file);
            fs.unlinkSync(imagePath);

            return res.status(200).send({
                status: "success",
                message: "Publicación eliminada",
                publicationRemove
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "error",
                message: "Error al eliminar la publicación"
            });
        });
};





exports.publications = (req, res) => {

    const paramsId = req.params.id;

    PublicationModel.find({ "user": paramsId })
        .sort("-created_at")
        .populate("user", "-password -__v -role -email")
        .then((publications) => {
            if (publications.length <= 0) {
                return res.status(200).send({
                    status: "error",
                    message: "No se encontro ninguna publicacion"
                });
            };
            return res.status(200).send({
                status: "success",
                message: "Publicaciónes de usuario con sesion iniciada",
                publications
            });
        })
        .catch((err) => {
            return res.status(500).send({
                status: "success",
                message: "Error al buscar publicaciones"
            });
        });
};





exports.upload = (req, res) => {

    const publicationId = req.params.id;

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

    PublicationModel.findOneAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true })
        .then((publicationUpdated) => {
            if (!publicationUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "El usuario no existe"
                });
            };
            return res.status(200).send({
                status: "success",
                message: "Subida de imagen",
                publicationUpdated: publicationUpdated
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





exports.media = (req, res) => {

    const file = req.params.file;
    const filePath = "./uploads/publications/" + file;

    fs.stat(filePath, (err, exists) => {

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        };

        return res.sendFile(path.resolve(filePath));

    });
};





exports.feed = async (req, res) => {

    try {
        const myFollows = await followService.followUserIds(req.user.id);

        const publications = await PublicationModel.find({ user: myFollows.following })
            .populate("user", "-password -role -__v")
            .sort("-created_at")

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            following: myFollows.following,
            publications
        });
    }
    catch (err) {
        return res.status(500).send({
            status: "error",
            message: "No se pudo cargar el Feed"
        });
    }
};