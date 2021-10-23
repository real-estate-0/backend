import config from "config";
import Redis from "ioredis";

type RedisType = "app" | "socket" | "queue" | "auth";

const getConnection = (type: RedisType) => {
  const redisInfo: any = config.get(`redis.${type}`);
  const redis = new Redis(redisInfo.port, redisInfo.host, {
    password: redisInfo.password,
  });
  return redis;
};

export { getConnection };
