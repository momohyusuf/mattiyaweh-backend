const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    refreshToken: String,
    accountBlocked: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Token", TokenSchema);
