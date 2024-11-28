const Forum = require('../models/forum');
const Comment = require('../models/comment');

// Crear un nuevo foro
const createForum = async (req, res) => {
    const { forumTitle, forumDescription, forumId } = req.body;

    try {
        // Crear el nuevo foro
        const newForum = new Forum({
            creatorName: req.user.name,  // El nombre del creador es tomado del usuario autenticado
            forumTitle,
            forumDescription,
            forumId
        });

        // Guardar el foro en la base de datos
        await newForum.save();

        res.status(200).json({ success: true, message: 'Foro creado con éxito' });
    } catch (error) {
        console.error('Error al crear el foro:', error);
        res.status(500).json({ success: false, message: 'Error al crear el foro' });
    }
};

// Obtener todos los foros
const getForums = async (req, res) => {
    try {
        // Obtener todos los foros y poblamos los comentarios relacionados
        const forums = await Forum.find().populate('comments');
        res.status(200).json({ success: true, forums });
    } catch (error) {
        console.error('Error al obtener los foros:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los foros' });
    }
};

module.exports = {
    createForum,
    getForums
};
