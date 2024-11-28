const express = require('express');
const mongoose = require('mongoose');
const Forum = require('../models/forum');
const Comment = require('../models/comment');
const authMiddleware = require('../middleware/authMiddleware'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

// Crear un foro nuevo
router.post('/', async (req, res) => {
    try {
        const { forumId, forumTitle, forumDescription, creatorName } = req.body;

        // Validar datos recibidos
        if (!forumId || !forumTitle || !forumDescription || !creatorName) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos (forumId, forumTitle, forumDescription, creatorName) son requeridos.',
            });
        }

        // Crear el nuevo foro
        const newForum = new Forum({
            forumId,
            forumTitle,
            forumDescription,
            creatorName,
            createdAt: new Date(), // Fecha actual
        });

        // Guardar el foro en la base de datos
        await newForum.save();

        // Responder con éxito
        return res.status(201).json({
            success: true,
            message: 'Foro creado con éxito',
            forum: newForum, // Devolver los datos del foro creado
        });
    } catch (error) {
        console.error('Error al crear el foro:', error);

        // Responder con error interno
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.',
            error: error.message,
        });
    }
});

// Obtener todos los foros
router.get('/', async (req, res) => {
    try {
        const forums = await Forum.find().populate('comments');
        res.status(200).json({ success: true, forums });  // Asegúrate de envolver los datos en un objeto con "success"
    } catch (error) {
        console.error('Error al obtener los foros:', error);
        res.status(500).json({ success: false, message: 'Hubo un problema al obtener los foros.' });
    }
});

// Ruta para agregar un comentario al foro
router.post('/add-comment', async (req, res) => {
    const { forumId, commentText, userName } = req.body; // Obtener userName del cuerpo de la solicitud

    // Verifica si los datos están presentes
    if (!forumId || !commentText || !userName) {
        return res.status(400).json({ message: 'El foro, el texto del comentario y el nombre de usuario son requeridos' });
    }

    try {
        // Intenta encontrar el foro usando el forumId
        let forum = await Forum.findOne({ forumId });

        if (!forum) {
            return res.status(404).json({ message: 'Foro no encontrado' });
        }

        // Crea el nuevo comentario
        const newComment = new Comment({
            forumId: forumId,  // Usa el forumId directamente
            commentText,
            userName, // Guardar el nombre del usuario en el comentario
        });

        // Guarda el comentario en la base de datos
        await newComment.save();

        // Agrega el comentario al foro
        forum.comments.push(newComment._id);
        await forum.save();

        // Devuelve el comentario creado
        res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error al guardar el comentario:', error);
        res.status(500).json({ message: 'Error al guardar el comentario en la base de datos.', error: error.message });
    }
});

// Ruta para agregar una respuesta a un comentario
router.post('/add-reply', async (req, res) => {
    const { forumId, commentId, replyText, userName } = req.body; // Obtener datos de la solicitud

    // Verifica si los datos están presentes
    if (!forumId || !commentId || !replyText || !userName) {
        return res.status(400).json({ message: 'El foro, el comentario, el texto de la respuesta y el nombre de usuario son requeridos' });
    }

    try {
        // Intenta encontrar el foro usando el forumId
        let forum = await Forum.findOne({ forumId });
        if (!forum) {
            return res.status(404).json({ message: 'Foro no encontrado' });
        }

        // Intenta encontrar el comentario usando el commentId
        let comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Crea la nueva respuesta (un comentario dentro de la sección de respuestas)
        const newReply = new Comment({
            forumId: forumId, // Usa el forumId directamente
            commentText: replyText, // Texto de la respuesta
            userName, // Nombre del usuario
            parentCommentId: commentId, // Se refiere al comentario padre
        });

        // Guarda la respuesta en la base de datos
        await newReply.save();

        // Agrega la respuesta al comentario en la base de datos
        comment.replies.push(newReply._id);
        await comment.save();

        // Devuelve la respuesta creada
        res.status(201).json({ success: true, reply: newReply });
    } catch (error) {
        console.error('Error al guardar la respuesta:', error);
        res.status(500).json({ message: 'Error al guardar la respuesta en la base de datos.', error: error.message });
    }
});

// Ruta para obtener los comentarios y respuestas de un foro específico
router.get('/:forumId/comments', async (req, res) => {
    const { forumId } = req.params;  // Obtiene el forumId de la URL

    try {
        // Busca el foro utilizando el forumId
        const forum = await Forum.findOne({ forumId }); // Usamos forumId directamente

        if (!forum) {
            return res.status(404).json({ success: false, message: 'Foro no encontrado' });
        }

        // Obtiene los comentarios asociados a ese foro
        const comments = await Comment.find({ _id: { $in: forum.comments } })
            .populate('replies') // Aseguramos que las respuestas también sean cargadas
            .exec();

        // Devuelve los comentarios del foro, junto con las respuestas ya incluidas
        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
        res.status(500).json({ success: false, message: 'Hubo un problema al obtener los comentarios', error: error.message });
    }
});

router.delete('/:itemType/:itemId', async (req, res) => {
    const { itemType, itemId } = req.params;  // Obtiene el tipo de item (comment o reply) y el ID

    try {
        if (itemType === 'comment') {
            // Elimina el comentario y todas sus respuestas
            const comment = await Comment.findById(itemId);
            if (!comment) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }

            // Elimina todas las respuestas asociadas a este comentario
            await Comment.deleteMany({ _id: { $in: comment.replies } });

            // Elimina el comentario utilizando findByIdAndDelete
            await Comment.findByIdAndDelete(itemId);
            return res.status(200).json({ success: true, message: 'Comentario eliminado con éxito' });
        } else if (itemType === 'reply') {
            // Elimina la respuesta
            const reply = await Comment.findById(itemId);
            if (!reply) {
                return res.status(404).json({ message: 'Respuesta no encontrada' });
            }

            // Verifica si el comentario existe antes de intentar eliminar la respuesta
            const comment = await Comment.findById(reply.parentCommentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comentario asociado no encontrado' });
            }

            // Elimina la respuesta del comentario
            comment.replies.pull(reply._id);
            await comment.save();

            // Elimina la respuesta utilizando findByIdAndDelete
            await Comment.findByIdAndDelete(itemId);
            return res.status(200).json({ success: true, message: 'Respuesta eliminada con éxito' });
        } else {
            return res.status(400).json({ message: 'Tipo de item inválido' });
        }
    } catch (error) {
        console.error('Error al eliminar item:', error);  // Aquí se registra el error para ayudar en la depuración
        res.status(500).json({ message: 'Error al eliminar item', error: error.message });
    }
});



module.exports = router;