const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  linkToken: { type: String, required: true }, // لصاحب الكويز
  answers: { type: Object, required: true },
  ownerEmail: { type: String, required: true }, // ايميل صاحب الكويز
  ownerName: { type: String, required: true }, // اسم صاحب الكويز
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('answer', answerSchema);
