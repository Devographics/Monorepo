import { captureMessage } from "@sentry/node";
import Redis from "ioredis";
import { serverConfig } from "~/config/server";

captureMessage("Creating a connection to Redis");
const redis = new Redis(serverConfig.redisUrl);

export const getRedisClient = () => {
  return redis;
};

// TODO: only do once
/*
Syntax with "node-redis"
=> trickier because of the need to manage connection
export const getRedisClient = async () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  await redisClient.connect();
  return redisClient;
};
*/
