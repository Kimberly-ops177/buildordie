const express = require("express");
const { protect } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const PROBLEMS = {
  React:   { title: "Build a virtualized list component", difficulty: "INTERMEDIATE", xp: 380 },
  Node:    { title: "Rate limiter from scratch", difficulty: "INTERMEDIATE", xp: 420 },
  Python:  { title: "Build a task queue without Celery", difficulty: "HARD", xp: 580 },
  DevOps:  { title: "Zero-downtime deployment pipeline", difficulty: "HARD", xp: 650 },
  MongoDB: { title: "Design a schema for a Twitter clone", difficulty: "INTERMEDIATE", xp: 400 },
  Docker:  { title: "Multi-stage production Dockerfile", difficulty: "BEGINNER", xp: 250 },
};

router.get("/problems", apiLimiter, (req, res) => {
  res.json(PROBLEMS);
});

router.get("/problems/:skill", apiLimiter, (req, res) => {
  const problem = PROBLEMS[req.params.skill];
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  res.json(problem);
});

router.post("/submit", protect, async (req, res, next) => {
  try {
    const { skill, repo } = req.body;
    if (!skill || !repo) return res.status(400).json({ message: "Skill and repo required" });
    const problem = PROBLEMS[skill];
    if (!problem) return res.status(404).json({ message: "Invalid skill" });
    res.json({ message: "Submitted for peer review", skill, repo, xpPending: problem.xp, status: "pending_review" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;