// models/revisionComment.js
const mongoose = require('mongoose');

const revisionCommentSchema = new mongoose.Schema({
    revisionId: {
        type: String,  // Puedes usar String si el ID de la revisión es de 13 caracteres
        required: true
    },
    userName: {
        type: String,
        default: 'Usuario Anónimo',
    },
    commentText: {
        type: String,
        required: true,
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RevisionComment',
        default: null,
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RevisionComment',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const RevisionComment = mongoose.model('RevisionComment', revisionCommentSchema);

module.exports = RevisionComment;
