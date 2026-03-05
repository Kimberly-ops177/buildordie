const mongoose = require("mongoose");

const commitmentSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project:     { type: String, required: true, trim: true, minlength: 4, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  stack:       [{ type: String }],
  deadline:    { type: Date, required: true },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  status:      { type: String, enum: ["building", "shipping", "danger", "shipped", "failed"], default: "building" },
  repo:        { type: String },
  votes:       [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  shames:      [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublic:    { type: Boolean, default: true },
  shippedAt:   { type: Date },
  xpAwarded:   { type: Boolean, default: false },
}, { timestamps: true });

// Auto-update status based on deadline
commitmentSchema.methods.updateStatus = function () {
  const now = new Date();
  const daysLeft = Math.ceil((this.deadline - now) / (1000 * 60 * 60 * 24));

  if (this.status === "shipped") return;
  if (now > this.deadline) { this.status = "failed"; return; }
  if (daysLeft <= 2) { this.status = "danger"; return; }
  if (this.progress >= 80) { this.status = "shipping"; return; }
  this.status = "building";
};

module.exports = mongoose.model("Commitment", commitmentSchema);