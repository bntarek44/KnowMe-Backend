const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
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
      type: String,
      default: ""
    },
    linkToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);


const User = mongoose.model("User", userSchema);

module.exports = User;
