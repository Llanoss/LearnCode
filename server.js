const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User'); // Importar el modelo de usuario
const Forum = require('./models/forum');
const Revision = require('./models/revision');
const Comment = require('./models/comment');
const { protect } = require('./middleware/authMiddleware'); // Middleware de autenticación
const forumRoutes = require('./routes/forumRoutes'); // Importar las rutas del foro
const revisionRoutes = require('./routes/revisionRoutes'); 

dotenv.config(); // Cargar variables de entorno desde .env

// Inicializar Express
const app = express();

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });

    try {
        const decoded = jwt.verify(token, 'tu_secreto');
        req.user = decoded; // Agregar la información del usuario al objeto de la solicitud
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
    }
}

// Middleware
app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Configuración básica de CORS

// Configuración de CORS detallada (si es necesario)
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'], // Orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true, // Permitir cookies
};
app.use(cors(corsOptions));

// Conexión con MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((err) => console.error('Error al conectar con la base de datos:', err));

// Rutas de registro de usuario
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            const message =
                existingUser.email === email
                    ? 'El correo ya está registrado. Usa otro.'
                    : 'El nombre de usuario no está disponible. Usa otro.';
            return res.status(400).json({ message });
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Hubo un problema al registrar el usuario' });
    }
});

// Ruta de inicio de sesion
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado. Por favor, regístrate.' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Hubo un problema al intentar iniciar sesión.' });
    }
});

// Ruta de perfil protegida
app.get('/api/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Hubo un problema al obtener el perfil.' });
    }
});

// Actualizacion de perfil
app.put('/api/profile', protect, async (req, res) => {
    const userId = req.user.id; // Obtener el ID del usuario autenticado del token
    const { name, email, password } = req.body; // Datos enviados por el cliente

    try {
        // Validar si se envió la contraseña para cambios sensibles
        if (!password) {
            return res.status(400).json({ message: 'Debes proporcionar tu contraseña para guardar los cambios.' });
        }

        // Verificar que la contraseña ingresada sea válida
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        // Actualizar los datos del usuario
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email }, // Solo actualizamos estos campos
            { new: true, runValidators: true } // Devuelve el documento actualizado
        );

        res.status(200).json({
            message: 'Perfil actualizado con éxito',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ message: 'Hubo un problema al actualizar tu perfil.' });
    }
});

// Ruta de logout 
app.post('/api/auth/logout', (req, res) => {
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
});

// Rutas del foro (importada)
app.use('/api/forums', forumRoutes);

// Ruta para buscar foros
app.get('/api/foros/buscar', async (req, res) => {
    const { query } = req.query;  // Recibimos el parámetro 'query' de la URL
    try {
        const foros = await Forum.find({
            $or: [
                { creatorName: { $regex: query, $options: 'i' } },  // Búsqueda por creador
                { forumTitle: { $regex: query, $options: 'i' } }    // Búsqueda por título
            ]
        });
        res.json(foros);  // Retornamos los foros encontrados
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar foros', error });
    }
});

// Rutas de las revisiones (Importadas)
app.use('/api/revisions', revisionRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000; // Puerto del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
