const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    forumId: {
        type: String, 
        required: true,
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
        ref: 'Comment',
        default: null,
    },
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
