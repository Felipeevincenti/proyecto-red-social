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
router.get("/profiles", authMiddleware.auth, userController.profiles);
router.put("/update", authMiddleware.auth, userController.update);
router.delete("/delete/:id", authMiddleware.auth, userController.delete);
router.post("/upload", [authMiddleware.auth, uploads.single("file0")], userController.upload);
router.get("/avatar/:file", userController.avatar);
router.get("/counters/:id?", authMiddleware.auth, userController.counters);
router.get("/buscar/:busqueda", authMiddleware.auth, userController.buscarUsuario);

// Exportacion de rutas
module.exports = router;