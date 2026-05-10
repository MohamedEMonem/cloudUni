import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
let redis: Redis;

if (redisUrl && (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://"))) {
  redis = new Redis(redisUrl);
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  });
}

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis Error:", err));

export default redis;
