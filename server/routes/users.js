const express = require("express");
const User = require("../models/User");
const Commitment = require("../models/Commitment");
const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// @GET /api/users/leaderboard
router.get("/leaderboard", apiLimiter, async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select("username country streak xp level shipped")
      .sort({ xp: -1 })
      .limit(50);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @PUT /api/users/profile — update own profile
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { bio, github, skills, country } = req.body;
    const user = await User.findById(req.user._id);

    if (bio !== undefined) user.bio = bio;
    if (github !== undefined) user.github = github;
    if (skills !== undefined) user.skills = skills;
    if (country !== undefined) user.country = country;

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @GET /api/users/:username — public profile (keep this LAST)
router.get("/:username", apiLimiter, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password -email");
    if (!user) return res.status(404).json({ message: "Builder not found" });

    const commitments = await Commitment.find({ user: user._id, isPublic: true })
      .sort({ createdAt: -1 }).limit(10);

    res.json({ user, commitments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;