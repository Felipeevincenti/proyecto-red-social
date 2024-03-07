// Importaciones de dependencias y otras cosas
const express = require('express');
const router = express.Router();

// Importacion de controllers
const followController = require('../controllers/follow.controller');

// Importacion de middlewares
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas
router.post("/follow", authMiddleware.auth, followController.follow);
router.delete("/unfollow/:id", authMiddleware.auth, followController.unfollow);
router.get("/following/:id?/:page?", authMiddleware.auth, followController.following);
router.get("/followers/:id?/:page?", authMiddleware.auth, followController.followers);

// Exportacion de rutas
module.exports = router;