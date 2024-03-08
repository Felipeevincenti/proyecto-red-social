// Importacion de dependencias y otras cosas
const { Schema, model } = require('mongoose');

// Creacion de Schema
const FollowSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Exportacion de modelo
module.exports = model("Follow", FollowSchema, "follows")