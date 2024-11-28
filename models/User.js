const mongoose = require('mongoose');

// Esquema del usuario
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Crear el modelo basado en el esquema
const User = mongoose.model('User', userSchema);

module.exports = User;
