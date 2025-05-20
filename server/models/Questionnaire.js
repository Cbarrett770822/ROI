const mongoose = require('mongoose');

const QuestionnaireSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  answers: {
    type: Map,
    of: String,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema);
