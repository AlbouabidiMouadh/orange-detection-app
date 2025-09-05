const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    contentType: {
      type: String,
      enum: ["image", "video"], // restrict to known types
      required: true,
    },
    contentUrl: {
      type: String,
      required: true,
    },
    result: {
      type: String, // e.g., "orange detected", "no orange", "ripe", etc.
      required: true,
    },
  },
  { timestamps: true } // auto add createdAt & updatedAt
);

module.exports = mongoose.model("History", historySchema);
