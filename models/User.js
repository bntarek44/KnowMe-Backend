const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hasAnsweredQuiz: {
  type: Boolean,
  default: false,
},
deletionRequested: {
  type: Boolean,
  default: false
},
deletionDate: {
  type: Date,
  default: null
},
  imageUrl: {
    type: String,  // لو حابب تخزن صورة المستخدم
    default: "",   // مثلاً لو جوجل مابعتش صورة
  },
}, {
  timestamps: true // سيقوم بإضافة createdAt و updatedAt تلقائيًا
});

const User = mongoose.model("User", userSchema);

module.exports = User;
