const Redis = require("ioredis");

let redis;

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  No REDIS_URL found — Redis disabled");
    return null;
  }

  redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err.message));

  return redis;
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
