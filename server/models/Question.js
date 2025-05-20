const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
});

const QuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  options: [OptionSchema]
});

module.exports = mongoose.model('Question', QuestionSchema);
