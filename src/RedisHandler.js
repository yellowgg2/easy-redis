import redis from "redis";

let redisHost = "192.168.0.200";

class RedisHandler {
  constructor() {
    if (!RedisHandler.onlyInstance) {
      RedisHandler.onlyInstance = this;
      const options = {
        host: redisHost
      };
      this.redisClient = redis.createClient(options);
      this.redisClient.on("connect", () => {
        console.log("Redis Connected!!!!!!!!!!!!!!!!!!!");
      });

      this.redisClient.on("error", err => {
        console.log("Something went wrong " + err);
      });
    }

    return RedisHandler.onlyInstance;
  }
}
export default RedisHandler;
