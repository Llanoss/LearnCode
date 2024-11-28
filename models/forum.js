const mongoose = require('mongoose');

// Definir el esquema del foro
const forumSchema = new mongoose.Schema({
    forumId: {
        type: String,
        required: true,
        unique: true
    },
    creatorName: {
        type: String,
        required: true
    },
    forumTitle: {
        type: String,
        required: true
    },
    forumDescription: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now // Asegura que la fecha de creación se genere por defecto
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' // Referencias a comentarios de este foro
    }]
}, {
    timestamps: true // Agrega automáticamente createdAt y updatedAt
});

// Crear el modelo a partir del esquema
const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum;
