const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  answers: {
    type: Map,
    of: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Data", dataSchema);
