const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const commitmentRoutes = require("./routes/commitments");
const sprintRoutes = require("./routes/sprints");
const userRoutes = require("./routes/users");
const arenaRoutes = require("./routes/arena");
const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth",        authRoutes);
app.use("/api/commitments", commitmentRoutes);
app.use("/api/sprints",     sprintRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/arena",       arenaRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "BUILDORDIE API RUNNING", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🔥 BuildOrDie API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});