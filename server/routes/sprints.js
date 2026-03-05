const express = require("express");
const Sprint = require("../models/Sprint");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// @GET /api/sprints/current
router.get("/current", apiLimiter, async (req, res, next) => {
  try {
    const sprint = await Sprint.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!sprint) return res.status(404).json({ message: "No active sprint" });
    res.json(sprint);
  } catch (error) {
    next(error);
  }
});

// @GET /api/sprints — all past sprints
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const sprints = await Sprint.find({ isActive: false }).sort({ createdAt: -1 }).limit(20);
    res.json(sprints);
  } catch (error) {
    next(error);
  }
});

// @POST /api/sprints/:id/join
router.post("/:id/join", protect, async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    if (!sprint.participants.includes(req.user._id)) {
      sprint.participants.push(req.user._id);
      await sprint.save();
    }

    res.json({ message: "Joined sprint", participants: sprint.participants.length });
  } catch (error) {
    next(error);
  }
});

// @POST /api/sprints/:id/submit
router.post("/:id/submit", protect, async (req, res, next) => {
  try {
    const { repo, comment, stack } = req.body;
    if (!repo) return res.status(400).json({ message: "Repo URL required" });

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    const existing = await Submission.findOne({ user: req.user._id, sprint: req.params.id });
    if (existing) return res.status(400).json({ message: "Already submitted" });

    const now = new Date();
    const submittedEarly = now < new Date(sprint.endsAt - 6 * 3600000);

    const submission = await Submission.create({
      user: req.user._id,
      sprint: req.params.id,
      repo, comment,
      stack: stack || [],
      submittedEarly,
    });

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += sprint.xpReward + (submittedEarly ? 50 : 0);
    user.shipped += 1;
    user.streak += 1;
    user.lastShipped = now;
    if (user.streak > user.longestStreak) user.longestStreak = user.streak;
    user.calculateLevel();
    await user.save();

    await submission.populate("user", "username country");
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

// @GET /api/sprints/:id/submissions
router.get("/:id/submissions", apiLimiter, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ sprint: req.params.id })
      .populate("user", "username country")
      .sort({ votes: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

// @PUT /api/sprints/submissions/:id/vote
router.put("/submissions/:id/vote", protect, async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const voted = submission.votes.includes(req.user._id);
    if (voted) {
      submission.votes = submission.votes.filter(v => v.toString() !== req.user._id.toString());
    } else {
      submission.votes.push(req.user._id);
    }

    await submission.save();
    res.json({ votes: submission.votes.length, voted: !voted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;