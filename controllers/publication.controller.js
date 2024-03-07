// Importacion de dependencias y otras cosas
const mongoosePagination = require('mongoose-pagination');

// Importacion de modelos
const publicationModel = require('../models/publication.model');
const PublicationModel = require('../models/publication.model');

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
            };
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

    let page = 1;

    if (req.params.page) page = req.params.page

    const itemsPerPage = 6;

    PublicationModel.find({ "user": paramsId })
        .then((publications) => {

            if (publications.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    message: "No se encontro ninguna publicacion"
                });
            }

            const total = publications.length;

            PublicationModel.find({ "user": paramsId })
                .sort("-created_at") // Hace que se ordenen de más nueva a más vieja
                .populate("user", "-password -__v -role")
                .paginate(page, itemsPerPage)
                .then((publications) => {
                    return res.status(200).send({
                        status: "success",
                        message: "Publicaciónes de usuario con sesion iniciada",
                        total,
                        pages: Math.ceil(total / itemsPerPage),
                        publications
                    });
                })
                .catch((err) => {
                    return res.status(200).send({
                        status: "success",
                        message: "Error al buscar publicaciones"
                    });
                })
        })
        .catch((err) => {
            return res.status(200).send({
                status: "success",
                message: "Error al buscar publicaciones"
            });
        })

};