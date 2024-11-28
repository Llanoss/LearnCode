const Comment = require('../models/comment');  // Asegúrate de importar el modelo correcto

// Función para agregar un comentario
exports.addComment = async (req, res) => {
    const { revisionId, commentText, userName } = req.body;  // Extraer datos de la solicitud

    // Validación de datos
    if (!revisionId || !commentText || !userName) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Crear un nuevo comentario
        const newComment = new Comment({
            revisionId,
            commentText,
            userName,
        });

        // Guardar el comentario en la base de datos
        const savedComment = await newComment.save();

        // Responder con el comentario guardado
        res.status(201).json({
            success: true,
            commentId: savedComment._id,
            message: 'Comentario agregado exitosamente.',
        });
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).json({ success: false, message: 'Hubo un error al agregar el comentario', error: error.message });
    }
};

// Función para obtener todos los comentarios de una revisión
exports.getComments = async (req, res) => {
    const { revisionId } = req.params; // Obtener el ID de la revisión

    try {
        const comments = await Comment.find({ revisionId })
            .populate('replies')  // Si los comentarios tienen respuestas, puedes usar populate
            .sort({ createdAt: -1 }); // Ordenar comentarios por fecha (últimos primero)

        if (!comments) {
            return res.status(404).json({ message: 'No se encontraron comentarios' });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ message: 'Hubo un error al obtener los comentarios', error: error.message });
    }
};
