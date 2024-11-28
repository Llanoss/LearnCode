const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Obtener perfil del usuario
exports.getProfile = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'No estás autenticado. Inicia sesión.' });
    }

    try {
        // Verificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar al usuario en la base de datos
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
    const { name, email, avatar } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado

    if (!token) {
        return res.status(401).json({ message: 'No estás autenticado. Inicia sesión.' });
    }

    try {
        // Verificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar al usuario en la base de datos
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar actualizaciones y aplicar cambios
        user.name = name || user.name;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;

        await user.save();
        res.json({ message: 'Perfil actualizado', user });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ error: error.message });
    }
};
