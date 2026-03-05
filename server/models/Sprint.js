const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  requirements: [{ type: String }],
  constraints:  [{ type: String }],
  difficulty:   { type: String, enum: ["BEGINNER", "INTERMEDIATE", "HARD"], default: "INTERMEDIATE" },
  xpReward:     { type: Number, default: 450 },
  tags:         [{ type: String }],
  week:         { type: Number, required: true },
  startsAt:     { type: Date, required: true },
  endsAt:       { type: Date, required: true },
  isActive:     { type: Boolean, default: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Sprint", sprintSchema);