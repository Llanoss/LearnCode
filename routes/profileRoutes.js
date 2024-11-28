const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');
const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
router.get('/', protect, getProfile);

// Ruta para actualizar el perfil del usuario autenticado
router.put('/', protect, updateProfile);

module.exports = router;
