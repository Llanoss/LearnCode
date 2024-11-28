const mongoose = require('mongoose');

// Definir el esquema de la revisión
const revisionSchema = new mongoose.Schema({
  revisionId: {
    type: String,
    required: true,
    unique: true
  },
  revisionTitle: {
    type: String,
    required: true
  },
  revisionDescription: {
    type: String,
    required: true
  },
  revisionCode: {
    type: String,
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' // Referencias a los comentarios de esta revisión
  }]
}, {
  timestamps: true // Agrega automáticamente createdAt y updatedAt
});

// Crear el modelo a partir del esquema
const Revision = mongoose.model('Revision', revisionSchema);

module.exports = Revision;
