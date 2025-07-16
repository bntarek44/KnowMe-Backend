const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  linkToken: { type: String, required: true },
  answers: { type: Object, required: true },
  ownerEmail: { type: String, required: true },
  ownerName: { type: String, required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  resultPercentage: { type: Number },         // ✅ النتيجة
  correctAnswersCount: { type: Number },      // ✅ عدد الصح
  totalQuestions: { type: Number },           // ✅ عدد الأسئلة
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('answer', answerSchema);
