// Importaciones de dependencias y otras cosas
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Importacion de controllers
const userController = require('../controllers/user.controller');

// Importacion de middlewares
const authMiddleware = require('../middlewares/auth.middleware');

// Configuracion de subida 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars");
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage });

// Rutas
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", authMiddleware.auth, userController.profile);
router.get("/profiles:page?", authMiddleware.auth, userController.profiles);
router.put("/update", authMiddleware.auth, userController.update);
router.post("/upload", [authMiddleware.auth, uploads.single("file0")], userController.upload);
router.get("/avatar/:file", userController.avatar);
router.get("/counters", authMiddleware.auth, userController.counters);

// Exportacion de rutas
module.exports = router;