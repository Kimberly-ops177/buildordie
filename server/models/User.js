const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  skills:   [{ type: String }],
  country:  { type: String, default: "KE" },
  streak:   { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastShipped:   { type: Date },
  xp:       { type: Number, default: 0 },
  level:    { type: Number, default: 1 },
  shipped:  { type: Number, default: 0 },
  failed:   { type: Number, default: 0 },
  avatar:   { type: String },
  bio:      { type: String, maxlength: 160 },
  github:   { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Level up based on XP
userSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.xp / 500) + 1;
};

module.exports = mongoose.model("User", userSchema);