// Importaciones de dependencias y otras cosas
const express = require('express');
const multer = require('multer')
const router = express.Router();

// Importacion de controllers
const publicationController = require('../controllers/publication.controller');

// Importacion de middlewares
const authMiddleware = require('../middlewares/auth.middleware');

// Configuracion de subida 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },
    filename: (req, file, cb) => {
        cb(null, "publication-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage });

// Rutas
router.post("/save", authMiddleware.auth, publicationController.save);
router.get("/details/:id", authMiddleware.auth, publicationController.details);
router.delete("/delete/:id", authMiddleware.auth, publicationController.remove);
router.get("/publications/:id/:page?", authMiddleware.auth, publicationController.publications);
router.post("/upload/:id", [authMiddleware.auth, uploads.single("file0")], publicationController.upload);
router.get("/media/:file", publicationController.media);
router.get("/feed", authMiddleware.auth, publicationController.feed);

// Exportacion de rutas
module.exports = router;