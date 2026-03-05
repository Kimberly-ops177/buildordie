const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sprint:  { type: mongoose.Schema.Types.ObjectId, ref: "Sprint", required: true },
  repo:    { type: String, required: true },
  comment: { type: String, maxlength: 300 },
  stack:   [{ type: String }],
  votes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status:  { type: String, enum: ["pending", "reviewed", "passed", "failed"], default: "pending" },
  xpAwarded: { type: Boolean, default: false },
  submittedEarly: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);