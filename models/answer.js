const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  linkToken: { type: String, required: true }, // لصاحب الكويز
  answers: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('answer', answerSchema);
