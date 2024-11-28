const express = require('express');
const mongoose = require('mongoose');
const Revision = require('../models/revision');
const RevisionComment = require('../models/revisionComment');  // Importar el modelo de comentarios de revisión
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Crear una nueva revisión
router.post('/', async (req, res) => {
    try {
        const { revisionId, revisionTitle, revisionDescription, revisionCode, creatorName } = req.body;

        // Validar los datos recibidos
        if (!revisionId || !revisionTitle || !revisionDescription || !revisionCode || !creatorName) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos.',
            });
        }

        // Crear la nueva revisión
        const newRevision = new Revision({
            revisionId,          // Usar el revisionId recibido
            revisionTitle,
            revisionDescription,
            revisionCode,
            creatorName,
            createdAt: new Date(),
        });

        // Guardar la revisión en la base de datos
        await newRevision.save();

        // Responder con éxito
        return res.status(201).json({
            success: true,
            message: 'Revisión creada con éxito',
            revision: newRevision,
        });
    } catch (error) {
        console.error('Error al crear la revisión:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.',
            error: error.message,
        });
    }
});

// Obtener todas las revisiones
router.get('/', async (req, res) => {
    try {
        const revisions = await Revision.find().populate('comments');
        res.status(200).json({ success: true, revisions });
    } catch (error) {
        console.error('Error al obtener las revisiones:', error);
        res.status(500).json({ success: false, message: 'Hubo un problema al obtener las revisiones.' });
    }
});

// Ruta para agregar un comentario a una revisión
router.post('/add-comment', async (req, res) => {
    const { revisionId, commentText, userName } = req.body;

    // Verificar que los datos necesarios están presentes
    if (!revisionId || !commentText || !userName) {
        return res.status(400).json({ message: 'La revisión, el texto del comentario y el nombre de usuario son requeridos' });
    }

    try {
        // Buscar la revisión usando el revisionId
        const revision = await Revision.findOne({ revisionId });

        if (!revision) {
            return res.status(404).json({ message: 'Revisión no encontrada' });
        }

        // Crear el comentario de la revisión
        const newComment = new RevisionComment({
            revisionId: revisionId,
            commentText,
            userName,
        });

        // Guardar el comentario en la base de datos
        await newComment.save();

        // Agregar el comentario a la revisión (si tienes un campo `comments` en la revisión)
        revision.comments.push(newComment._id);
        await revision.save();

        // Devolver el comentario creado
        res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error al guardar el comentario:', error);
        res.status(500).json({ message: 'Error al guardar el comentario en la base de datos', error: error.message });
    }
});

// Ruta para agregar una respuesta a un comentario de una revisión
router.post('/add-reply', async (req, res) => {
    const { revisionId, commentId, replyText, userName } = req.body;

    // Verifica si los datos están presentes
    if (!revisionId || !commentId || !replyText || !userName) {
        return res.status(400).json({ message: 'La revisión, el comentario, el texto de la respuesta y el nombre de usuario son requeridos' });
    }

    try {
        // Intenta encontrar la revisión usando el revisionId
        let revision = await Revision.findOne({ revisionId });
        if (!revision) {
            return res.status(404).json({ message: 'Revisión no encontrada' });
        }

        // Intenta encontrar el comentario usando el commentId
        let comment = await RevisionComment.findById(commentId); // Usamos RevisionComment en lugar de Comment
        if (!comment) {
            return res.status(404).json({ message: 'Comentario no encontrado' });
        }

        // Crea la nueva respuesta (un comentario dentro de la sección de respuestas)
        const newReply = new RevisionComment({
            revisionId: revisionId,  // Usa el revisionId directamente
            commentText: replyText,  // Texto de la respuesta
            userName,  // Nombre del usuario
            parentCommentId: commentId,  // Se refiere al comentario padre
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

// Ruta para obtener los comentarios y respuestas de una revisión específica
router.get('/:revisionId/comments', async (req, res) => {
    const { revisionId } = req.params;

    try {
        // Busca todos los comentarios relacionados con la revisión
        const comments = await RevisionComment.find({ revisionId, parentCommentId: null }) // Solo comentarios principales
            .populate('replies') // Si replies tiene referencias, asegúrate de configurarlo en el esquema
            .exec();

        if (!comments || comments.length === 0) {
            return res.status(404).json({ success: false, message: 'No hay comentarios para esta revisión.' });
        }

        // Devuelve los comentarios principales junto con las respuestas
        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
        res.status(500).json({ success: false, message: 'Hubo un problema al obtener los comentarios.', error: error.message });
    }
});


// Ruta para eliminar un comentario o respuesta
router.delete('/:itemType/:itemId', async (req, res) => {
    const { itemType, itemId } = req.params;

    try {
        if (itemType === 'comment') {
            // Elimina el comentario y todas sus respuestas
            const comment = await RevisionComment.findById(itemId);  // Usamos RevisionComment en lugar de Comment
            if (!comment) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }

            // Elimina todas las respuestas asociadas a este comentario
            await RevisionComment.deleteMany({ _id: { $in: comment.replies } });

            // Elimina el comentario utilizando findByIdAndDelete
            await RevisionComment.findByIdAndDelete(itemId);
            return res.status(200).json({ success: true, message: 'Comentario eliminado con éxito' });
        } else if (itemType === 'reply') {
            // Elimina la respuesta
            const reply = await RevisionComment.findById(itemId);  // Usamos RevisionComment en lugar de Comment
            if (!reply) {
                return res.status(404).json({ message: 'Respuesta no encontrada' });
            }

            // Verifica si el comentario existe antes de intentar eliminar la respuesta
            const comment = await RevisionComment.findById(reply.parentCommentId);  // Usamos RevisionComment en lugar de Comment
            if (!comment) {
                return res.status(404).json({ message: 'Comentario asociado no encontrado' });
            }

            // Elimina la respuesta del comentario
            comment.replies.pull(reply._id);
            await comment.save();

            // Elimina la respuesta utilizando findByIdAndDelete
            await RevisionComment.findByIdAndDelete(itemId);
            return res.status(200).json({ success: true, message: 'Respuesta eliminada con éxito' });
        } else {
            return res.status(400).json({ message: 'Tipo de item inválido' });
        }
    } catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({ message: 'Error al eliminar item', error: error.message });
    }
});

module.exports = router;
