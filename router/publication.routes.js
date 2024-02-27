// Importaciones de dependencias y otras cosas
const express = require('express');
const router = express.Router();

// Importacion de controllers
const publicationController = require('../controllers/publication.controller');

router.get("/prueba", publicationController.routes.publication);

// Exportacion de rutas
module.exports = router;