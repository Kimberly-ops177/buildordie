const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "30d" });

// @POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, skills, country } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "Username or email already taken" });
    }

    const user = await User.create({ username, email, password, skills: skills || [], country: country || "KE" });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      skills: user.skills,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    console.error("STACK:", error.stack);
    next(error);
  }
});

// @POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      skills: user.skills,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      shipped: user.shipped,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
});

// @GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;