const Forum = require('../models/forum');
const Comment = require('../models/comment');

// Crear un comentario en un foro
const createComment = async (req, res) => {
    const { forumId, commentText } = req.body;

    try {
        // Crear un nuevo comentario
        const newComment = new Comment({
            forumId,
            userName: req.user.name,  // El nombre del usuario autenticado
            commentText
        });

        // Guardar el comentario en la base de datos
        await newComment.save();

        // Agregar el comentario al foro correspondiente
        const forum = await Forum.findById(forumId);
        forum.comments.push(newComment);
        await forum.save();

        res.status(200).json({ success: true, message: 'Comentario creado con éxito' });
    } catch (error) {
        console.error('Error al crear el comentario:', error);
        res.status(500).json({ success: false, message: 'Error al crear el comentario' });
    }
};

// Crear una respuesta a un comentario
const createReply = async (req, res) => {
    const { commentId, replyText } = req.body;

    try {
        // Buscar el comentario al que se va a responder
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado' });

        // Crear la respuesta (un nuevo comentario)
        const reply = new Comment({
            forumId: comment.forumId,
            userName: req.user.name,
            commentText: replyText,
            parentCommentId: commentId  // Asociar como respuesta al comentario original
        });

        // Guardar la respuesta en la base de datos
        await reply.save();

        // Agregar la respuesta al comentario original
        comment.replies.push(reply);
        await comment.save();

        res.status(200).json({ success: true, message: 'Respuesta creada con éxito' });
    } catch (error) {
        console.error('Error al crear la respuesta:', error);
        res.status(500).json({ success: false, message: 'Error al crear la respuesta' });
    }
};

module.exports = {
    createComment,
    createReply
};
