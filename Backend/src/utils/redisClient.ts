import { createClient } from "redis";

function getRedisUrl() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const host = process.env.REDIS_HOST;
  if (host && (host.startsWith("redis://") || host.startsWith("rediss://"))) return host;
  const resolvedHost = host || "localhost";
  const port = process.env.REDIS_PORT || 6379;
  return `redis://${resolvedHost}:${port}`;
}

const redisClient = createClient({
  url: getRedisUrl(),
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
})();

export default redisClient;