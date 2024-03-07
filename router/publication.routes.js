// Importaciones de dependencias y otras cosas
const express = require('express');
const router = express.Router();

// Importacion de controllers
const publicationController = require('../controllers/publication.controller');

// Importacion de middlewares
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas
router.post("/save", authMiddleware.auth, publicationController.save);
router.get("/details/:id", authMiddleware.auth, publicationController.details);
router.delete("/delete/:id", authMiddleware.auth, publicationController.remove);
router.get("/publications/:id/:page?", authMiddleware.auth, publicationController.publications);

// Exportacion de rutas
module.exports = router;