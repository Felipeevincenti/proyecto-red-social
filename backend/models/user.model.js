// Importacion de dependencias y otras cosas
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Creacion de Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    bio: String,
    nick: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

// Exportacion de modelo
module.exports = model("User", UserSchema, "users")

