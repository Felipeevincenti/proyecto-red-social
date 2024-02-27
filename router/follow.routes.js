// Importaciones de dependencias y otras cosas
const express = require('express');
const router = express.Router();

// Importacion de controllers
const followController = require('../controllers/follow.controller');

router.get("/prueba", followController.routes.follow);

// Exportacion de rutas
module.exports = router;