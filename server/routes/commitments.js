const express = require("express");
const Commitment = require("../models/Commitment");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// @GET /api/commitments — get all public commitments
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const { status, sort, search, limit = 20, page = 1 } = req.query;

    let query = { isPublic: true };
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { project: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { stack: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === "DEADLINE") sortObj = { deadline: 1 };
    if (sort === "MOST VOTED") sortObj = { voteCount: -1 };
    if (sort === "PROGRESS") sortObj = { progress: -1 };

    const commitments = await Commitment.find(query)
      .populate("user", "username country")
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Commitment.countDocuments(query);

    res.json({ commitments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// @POST /api/commitments — create commitment
router.post("/", protect, async (req, res, next) => {
  try {
    const { project, description, stack, deadline } = req.body;

    if (!project || !description || !deadline) {
      return res.status(400).json({ message: "Project, description and deadline are required" });
    }

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + Number(deadline));

    const commitment = await Commitment.create({
      user: req.user._id,
      project,
      description,
      stack: stack || [],
      deadline: deadlineDate,
    });

    await commitment.populate("user", "username country");
    res.status(201).json(commitment);
  } catch (error) {
    next(error);
  }
});

// @PUT /api/commitments/:id/progress — update progress
router.put("/:id/progress", protect, async (req, res, next) => {
  try {
    const commitment = await Commitment.findById(req.params.id);
    if (!commitment) return res.status(404).json({ message: "Commitment not found" });
    if (commitment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your commitment" });
    }

    commitment.progress = req.body.progress;
    commitment.updateStatus();

    // Award XP and update streak if shipped
    if (req.body.progress === 100 && commitment.status !== "shipped") {
      commitment.status = "shipped";
      commitment.shippedAt = new Date();

      const user = await User.findById(req.user._id);
      user.shipped += 1;
      user.xp += 300;
      user.streak += 1;
      user.lastShipped = new Date();
      if (user.streak > user.longestStreak) user.longestStreak = user.streak;
      user.calculateLevel();
      await user.save();
    }

    await commitment.save();
    res.json(commitment);
  } catch (error) {
    next(error);
  }
});

// @PUT /api/commitments/:id/vote — vote on a commitment
router.put("/:id/vote", protect, async (req, res, next) => {
  try {
    const commitment = await Commitment.findById(req.params.id);
    if (!commitment) return res.status(404).json({ message: "Commitment not found" });

    const alreadyVoted = commitment.votes.includes(req.user._id);
    if (alreadyVoted) {
      commitment.votes = commitment.votes.filter(v => v.toString() !== req.user._id.toString());
    } else {
      commitment.votes.push(req.user._id);
    }

    await commitment.save();
    res.json({ votes: commitment.votes.length, voted: !alreadyVoted });
  } catch (error) {
    next(error);
  }
});

// @GET /api/commitments/mine — get my commitments
router.get("/mine", protect, async (req, res, next) => {
  try {
    const commitments = await Commitment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(commitments);
  } catch (error) {
    next(error);
  }
});

module.exports = router;