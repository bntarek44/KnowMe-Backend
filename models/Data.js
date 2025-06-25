const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  season: {
    type: String,
    required: true,
    enum: ["summer", "winter"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ربط بالإيميل أو ID الراجع من جوجل
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Data", dataSchema);
