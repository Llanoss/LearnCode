const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Asegurarse de que existe la cabecera Authorization y que el formato es correcto
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token del encabezado
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar el usuario al request
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Continuar al siguiente middleware
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.status(401).json({ message: 'No autorizado. Token inválido.' });
        }
    } else {
        // Caso cuando no se envía el token
        res.status(401).json({ message: 'No autorizado. Token no encontrado.' });
    }
};

module.exports = { protect };
